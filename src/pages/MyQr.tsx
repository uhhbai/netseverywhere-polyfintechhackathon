import React, { useState, useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import QRCode from "react-qr-code";
import axios from "axios";
import commonConfigs from "../../config.js";

import txnSuccess from "../assets/greenTick.png";
import txnFail from "../assets/redCross.png";

const MyQrPage = () => {
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState(
    "sandbox_nets|m|8ff8e5b6-d43e-4786-8ac5-7accf8c5bd9b"
  );
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseCode, setResponseCode] = useState("");
  const [instruction, setInstruction] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [txnStatus, setTxnStatus] = useState("idle"); // idle | qr | success | fail
  const [txnRetrievalRef, setTxnRetrievalRef] = useState("");
  const sseRef = useRef(null);
  const [qrError, setQrError] = useState("");

  const timerRef = useRef(null);
  const [secondsTimeout, setSecondsTimeout] = useState(300);
  const [convertTime, setConvertTime] = useState({ m: 5, s: 0 });

  // ==== TIMER: Only run when QR is shown ====
  useEffect(() => {
    if (txnStatus === "qr" && secondsTimeout > 0) {
      timerRef.current = setInterval(() => {
        setSecondsTimeout((prev) => {
          const newVal = prev - 1;
          setConvertTime({
            m: Math.floor(newVal / 60),
            s: newVal % 60,
          });
          if (newVal <= 0) {
            clearInterval(timerRef.current);
            handleTimeout();
          }
          return newVal;
        });
      }, 1000);
    }
    // Cleanup timer on status or unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [txnStatus]);

  // ==== CLEAN UP SSE ON UNMOUNT ====
  useEffect(() => {
    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, []);

  // ==== QR CODE REQUEST ====
  const requestNets = () => {
    setLoading(true);
    setErrorMsg("");
    setInstruction("");
    setQrError("");
    setTxnStatus("idle");

    const body = { txn_id: txnId, amt_in_dollars: amount, notify_mobile: 0 };

    axios
      .post(commonConfigs.apiUrls.requestNetsApi(), body, {
        headers: commonConfigs.apiHeader,
      })
      .then((res) => {
        const response = res.data.result.data;
        if (
          response.response_code === "00" &&
          response.txn_status === 1 &&
          response.qr_code
        ) {
          localStorage.setItem("txnRetrievalRef", response.txn_retrieval_ref);
          setQrCode("data:image/png;base64," + response.qr_code);
          setResponseCode(response.response_code);
          setTxnStatus("qr");
          setSecondsTimeout(300);
          setConvertTime({ m: 5, s: 0 });
          setTxnRetrievalRef(response.txn_retrieval_ref);
          startWebhookListener(response.txn_retrieval_ref);
        } else {
          setQrCode("");
          setResponseCode(response.response_code || "N.A.");
          setInstruction(
            response.network_status === 0 ? response.instruction : ""
          );
          setErrorMsg(
            response.network_status !== 0 ? "Frontend Error Message" : ""
          );
          setTxnStatus("fail");
          setTxnRetrievalRef("");
        }
      })
      .catch(() => {
        setErrorMsg("Network error or failed to get QR");
        setQrCode("");
        setTxnStatus("fail");
        setTxnRetrievalRef("");
      })
      .finally(() => setLoading(false));
  };

  // ==== SSE EVENT LISTENER ====
  const startWebhookListener = (retrievalRef) => {
    if (sseRef.current) {
      sseRef.current.close();
    }
    const url = commonConfigs.apiUrls.webhookNetsApi(retrievalRef);
    const evtSource = new EventSourcePolyfill(url, {
      headers: commonConfigs.apiHeader,
      heartbeatTimeout: 150000,
    });
    sseRef.current = evtSource;

    evtSource.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.message === "QR code scanned" && data.response_code === "00") {
        setTxnStatus("success");
        evtSource.close();
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (data.message === "Timeout") {
        evtSource.close();
        handleTimeout();
      }
    });

    evtSource.onerror = () => {
      evtSource.close();
      setErrorMsg("Network/Webhook error");
      setTxnStatus("fail");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  };

  // ==== HANDLE TIMEOUT: Query fallback ====
  const handleTimeout = () => {
    if (!txnRetrievalRef) {
      setTxnStatus("fail");
      return;
    }
    const body = {
      txn_retrieval_ref: txnRetrievalRef,
      frontend_timeout_status: 1,
    };
    axios
      .post(commonConfigs.apiUrls.queryNetsApi(), body, {
        headers: commonConfigs.apiHeader,
      })
      .then((res) => {
        const response = res.data.result.data;
        if (response.response_code === "00" && response.txn_status === 1) {
          setTxnStatus("success");
        } else {
          setTxnStatus("fail");
        }
      })
      .catch(() => {
        setTxnStatus("fail");
      });
  };

  // ==== QR RENDER ====
  const renderQrCode = () => {
    if (qrCode.startsWith("data:image/png;base64,")) {
      return (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <img
            alt="NETS QR Code"
            src={qrCode}
            style={{ width: "180px", height: "180px" }}
            onError={() => setQrError("Failed to load QR code image")}
          />
        </div>
      );
    }

    if (qrCode) {
      try {
        return (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <QRCode value={qrCode} size={180} />
          </div>
        );
      } catch {
        setQrError("Invalid QR Code data");
        return null;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-2xl font-bold">NETS QR Payment</h1>
        <p className="text-primary-foreground/80 mt-2">Generate QR codes for instant payments</p>
      </div>

      <div className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">{/* Payment Container */}
      <div className="bg-card rounded-2xl p-6 shadow-elegant border border-card-border">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Generate Payment QR</h2>
        </div>

        {/* Idle → QR form */}
        {txnStatus === "idle" && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Enter Amount (SGD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 text-xl font-medium text-center bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <button
                onClick={requestNets}
                disabled={loading || !amount}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all transform active:scale-95 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Generate NETS QR
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Waiting for scan */}
        {txnStatus === "qr" && (
          <div className="text-center space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              {renderQrCode()}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Scan to Pay</h3>
              <p className="text-3xl font-bold text-primary">${amount}</p>
              <p className="text-muted-foreground">Point your camera at the QR code to complete payment</p>
            </div>
            
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="text-warning font-semibold mb-1">Session expires in:</div>
              <div className="text-2xl font-mono font-bold text-warning">
                {convertTime.m.toString().padStart(2, "0")}:
                {convertTime.s.toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        )}

        {/* Success screen */}
        {txnStatus === "success" && (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
                <img
                  src={txnSuccess}
                  alt="Transaction Success"
                  className="w-16 h-16"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-success">Payment Successful!</h2>
                <p className="text-muted-foreground">Your transaction has been completed</p>
                <p className="text-xl font-semibold">${amount}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setTxnStatus("idle");
                setAmount("");
                setQrCode("");
                setResponseCode("");
                setTxnRetrievalRef("");
                setSecondsTimeout(300);
                setConvertTime({ m: 5, s: 0 });
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all transform active:scale-95"
            >
              Create New Payment
            </button>
          </div>
        )}

        {/* Failure screen */}
        {txnStatus === "fail" && (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                <img
                  src={txnFail}
                  alt="Transaction Failed"
                  className="w-16 h-16"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-destructive">Payment Failed</h2>
                <p className="text-muted-foreground">Something went wrong with your transaction</p>
                {errorMsg && (
                  <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{errorMsg}</p>
                )}
                {instruction && (
                  <p className="text-sm text-primary bg-primary/10 p-3 rounded-lg">{instruction}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                setTxnStatus("idle");
                setAmount("");
                setQrCode("");
                setResponseCode("");
                setTxnRetrievalRef("");
                setSecondsTimeout(300);
                setConvertTime({ m: 5, s: 0 });
                setErrorMsg("");
                setInstruction("");
                setQrError("");
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all transform active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
      
      {/* Errors and Debug Info */}
      {qrError && (
        <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-destructive font-medium">{qrError}</p>
        </div>
      )}
      
      {responseCode && responseCode !== "00" && txnStatus === "qr" && (
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Response Code: {responseCode}</p>
        </div>
      )}
      
      {/* Security Notice */}
      <div className="text-center p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1l3.09 6.26L22 9l-5.91 5.34L17.18 21 12 18.27 6.82 21l1.09-6.66L2 9l6.91-1.74L12 1z"/>
          </svg>
          <span className="text-sm font-medium text-primary">Secure Payment</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your payment is processed securely through NETS infrastructure
        </p>
      </div>
    </div>
    </div>
  );
};

export default MyQrPage;
