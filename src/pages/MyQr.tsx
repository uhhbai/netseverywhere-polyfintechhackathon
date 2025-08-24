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
    <div
      style={{
        margin: "50px auto",
        maxWidth: 480,
        textAlign: "center",
        backgroundColor: "#f0f4f7",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      }}
    >
      <h2>My QR Payment</h2>

      {/* Idle → QR form */}
      {txnStatus === "idle" && (
        <>
          <TextField
            label="Amount (SGD)"
            variant="outlined"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={requestNets}
            disabled={loading}
            sx={{ width: "100%", marginBottom: 2 }}
          >
            {loading ? "Generating..." : "Generate NETS QR"}
          </Button>
        </>
      )}

      {/* Waiting for scan */}
      {txnStatus === "qr" && (
        <>
          {renderQrCode()}
          <p>Scan to pay SGD {amount}</p>
          <h4>
            Timeout: {convertTime.m.toString().padStart(2, "0")}:
            {convertTime.s.toString().padStart(2, "0")}
          </h4>
        </>
      )}

      {/* Success screen */}
      {txnStatus === "success" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%", // or a fixed height, e.g. 300px
          }}
        >
          <img
            src={txnSuccess}
            alt="Transaction Success"
            style={{ width: "30%" }}
          />
          <h2 style={{ fontSize: "18px" }}>TRANSACTION COMPLETED</h2>
          <Button
            variant="contained"
            sx={{ width: 300, mt: 2 }}
            style={{ backgroundColor: "dodgerblue", borderRadius: "10px" }}
            onClick={() => {
              setTxnStatus("idle");
              setAmount("");
              setQrCode("");
              setResponseCode("");
              setTxnRetrievalRef("");
              setSecondsTimeout(300);
              setConvertTime({ m: 5, s: 0 });
            }}
          >
            Back to Test Page
          </Button>
        </div>
      )}

      {/* Failure screen */}
      {txnStatus === "fail" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%", // or a fixed height, e.g. 300px
          }}
        >
          <img
            src={txnFail}
            alt="Transaction Failed"
            style={{ width: "30%" }}
          />
          <h2 style={{ fontSize: "18px" }}>TRANSACTION FAILED</h2>
          <Button
            variant="contained"
            sx={{ width: 300, mt: 2 }}
            style={{ backgroundColor: "dodgerblue", borderRadius: "10px" }}
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
          >
            Back to Test Page
          </Button>
        </div>
      )}

      {/* Errors */}
      {qrError && <p style={{ color: "red" }}>{qrError}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {instruction && <p style={{ color: "blue" }}>{instruction}</p>}
      {responseCode && responseCode !== "00" && txnStatus === "qr" && (
        <p>Response Code: {responseCode}</p>
      )}
    </div>
  );
};

export default MyQrPage;
