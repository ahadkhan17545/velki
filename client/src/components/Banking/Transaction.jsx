import {
  useLazyGetUserByIdQuery,
  useUpdateBalanceMutation,
} from "@/redux/features/allApis/usersApi/usersApi";
import { setSingleUser } from "@/redux/slices/authSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const Transaction = ({ userId, availableBalance = 0 }) => {
  const { user, singleUser } = useSelector((state) => state.auth);
  const [updateBalance] = useUpdateBalanceMutation();
  const [getSingleUser] = useLazyGetUserByIdQuery();
  const [action, setAction] = useState("");
  const [amount, setAmount] = useState("");
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const reloadBalance = () => {
    if (!user) return;
    getSingleUser(user?._id).then(({ data }) => {
      dispatch(setSingleUser(data)); // Update Redux store with the latest balance
    });
  };

  const handleTransaction = async () => {
    if (!action) {
      addToast("Please select deposit or withdraw", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (!amount || amount <= 0) {
      addToast("Please enter a valid amount", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (action === "withdraw" && availableBalance < Number(amount)) {
      addToast("Insufficient balance", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (action === "deposit" && singleUser?.balance < Number(amount)) {
      addToast("Insufficient balance", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    const payload = {
      parentId: user?._id,
      userId: userId,
      amount: Number(amount),
      type: action,
    };

    const result = await updateBalance(payload);
    if (result?.error) {
      addToast(result.error, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    if (result?.data.modifiedCount > 0) {
      alert(result);
      addToast(
        action === "deposit" ? "Deposit successful" : "Withdrawal successful",
        {
          appearance: "success",
          autoDismiss: true,
        }
      );
      reloadBalance();
      setAmount("");
      setAction("");
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-row items-center justify-center">
        <button
          className={` px-1.5 py-0.5 border border-black text-white ${
            action === "deposit" ? "bg-green-500 scale-110" : "bg-blue-500"
          }`}
          onClick={() => setAction("deposit")}
        >
          D
        </button>
        <button
          className={` px-1.5 py-0.5 border border-black text-white ${
            action === "withdraw" ? "bg-green-500 scale-110" : "bg-yellow-700"
          }`}
          onClick={() => setAction("withdraw")}
        >
          W
        </button>
      </div>
      <input
        className="w-40 h-6 border border-black placeholder:text-xs sm:placeholder:text-sm px-4 py-2 outline-none"
        type="text"
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="w-8 h-6 px-1 border border-black text-black bg-yellow-400"
        onClick={handleTransaction}
      >
        Add
      </button>
    </div>
  );
};

export default Transaction;
