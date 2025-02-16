/* eslint-disable react/prop-types */
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import Button from "../Shared/Button/Button";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const PurchaseModal = ({ closeModal, isOpen, plant, refetch }) => {
  const { name, category, seller, quantity, price, _id } = plant;
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [stateQuantity, setStateQuantity] = useState(1);
  const [address, setAddress] = useState("");

  // Calculate total price 
  const totalPrice = parseFloat(stateQuantity * price).toFixed(2);

  //  Quantity Change
  const handleQuantity = (value) => {
    const newQuantity = parseInt(value, 10) || 1;

    if (newQuantity < 1) {
      return toast.error("Quantity cannot be less than 1");
    }

    if (newQuantity > quantity) {
      toast.error("Please select a quantity within the available stock");
      return;
    }

    setStateQuantity(newQuantity);
  };

  // Handle Payment Process
  const handlePayment = async () => {
    if (!address.trim()) {
      return toast.error("Please enter a delivery address");
    }

    const purchaseInfo = {
      customer: {
        name: user?.displayName,
        email: user?.email,
        image: user?.photoURL,
      },
      plantId: _id,
      price: parseFloat(totalPrice),
      quantity: stateQuantity,
      seller: seller?.email,
      address,
      status: "Pending",
    };

    try {
      const { data } = await axiosSecure.post(`/orderPurchase`, purchaseInfo);
      console.log("Purchase Success:", data);

      await axiosSecure.patch(`/plants/quantity/${_id}`, {
        quantityToUpdate: stateQuantity,
      });

      refetch();
      toast.success("Payment successful");
      closeModal();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-center leading-6 text-gray-900"
                >
                  Review Info Before Purchase
                </DialogTitle>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">Plant: {name}</p>
                  <p className="text-sm text-gray-500">Category: {category}</p>
                  <p className="text-sm text-gray-500">
                    Customer: {user?.displayName}
                  </p>
                  <p className="text-sm text-gray-500">Unit Price: ${price}</p>
                  <p className="text-sm text-gray-500">
                    Available Quantity: {quantity}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="mt-2 flex justify-between items-center">
                  <label className="text-sm text-gray-500">Quantity:</label>
                  <input
                    value={stateQuantity}
                    onChange={(e) => handleQuantity(e.target.value)}
                    className="p-2 bg-white border-2 rounded-md w-24"
                    type="number"
                    min="1"
                    max={quantity}
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Address Input */}
                <div className="mt-2">
                  <label className="text-sm text-gray-500">
                    Delivery Address:
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="p-2 w-full bg-white border-2 rounded-md mt-1"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Total Price */}
                <div className="mt-2 text-right">
                  <p className="text-lg font-semibold">Total: ${totalPrice}</p>
                </div>

                <div className="mt-5">
                  <Button
                    onClick={handlePayment}
                    label={`Purchase -> $${totalPrice}`}
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseModal;
