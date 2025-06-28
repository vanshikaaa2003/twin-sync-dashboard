import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);

export default function ToastProvider() {
  return (
    <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar newestOnTop theme="colored" />
  );
}