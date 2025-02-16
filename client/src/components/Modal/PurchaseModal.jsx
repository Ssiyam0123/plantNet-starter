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

  // State for purchase information
  const [purchaseInfo, setPurchaseInfo] = useState({
    customer: {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL,
    },
    plantId: _id,
    price: price, // Initial price
    quantity: 1, // Default quantity
    seller: seller?.email,
    address: "",
    status: "Pending",
  });

  // Update price dynamically based on quantity
  useEffect(() => {
    setPurchaseInfo((prev) => ({
      ...prev,
      price: prev.quantity * price,
    }));
  }, [purchaseInfo.quantity]);

  // Handle Quantity Change
  const handleQuantity = (value) => {
    const newQuantity = parseInt(value, 10) || 1;

    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }

    if (newQuantity > quantity) {
      toast.error("Please select a quantity within the available stock");
      return;
    }

    setPurchaseInfo((prev) => ({
      ...prev,
      quantity: newQuantity,
    }));
  };

  // Handle Payment Process
  const handlePayment = async () => {
    console.log("Purchase Data:", purchaseInfo);
    // toast.success("Proceeding to payment...");
    // Add API request here
    try {
      const { data } = await axiosSecure.post(`/orderPurchase`, purchaseInfo);
      console.log(data);

      await axiosSecure.patch(`/plants/quantity/${_id}`, {
        quantityToUpdate: purchaseInfo.quantity,
      });

      refetch();
      toast.success("Payment successfull");

      closeModal();
    } catch (error) {
      console.log(error);
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
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Category: {category}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Customer: {user?.displayName}
                  </p>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">Unit Price: ${price}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Available Quantity: {quantity}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="mt-2 flex justify-between items-center">
                  <label className="text-sm text-gray-500">Quantity:</label>
                  <input
                    value={purchaseInfo.quantity}
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
                    value={purchaseInfo.address}
                    onChange={(e) =>
                      setPurchaseInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="p-2 w-full bg-white border-2 rounded-md mt-1"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Total Price */}
                <div className="mt-2 text-right">
                  <p className="text-lg font-semibold">
                    Total: ${purchaseInfo.price}
                  </p>
                </div>

                <div className="mt-5">
                  <Button
                    onClick={handlePayment}
                    label={`Purchase -> $${purchaseInfo.price}`}
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
