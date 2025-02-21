import PropTypes from "prop-types";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment } from "react";
import UpdatePlantForm from "../Form/UpdatePlantForm";
import imagebb from "../../api/imagebb";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast"; // Optional: For user feedback

const UpdatePlantModal = ({
  setIsEditModalOpen,
  isOpen,
  id,
  plant,
  refetch,
}) => {
  // ✅ useMutation should be declared at the top level of the component
  const { mutate: updatePlant, isLoading } = useMutation({
    mutationFn: async (updateData) => {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update/${id}`,
        updateData
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Plant updated successfully!"); // User feedback
      setIsEditModalOpen(false);
      refetch(); // Close modal on success
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error("Failed to update plant.");
    },
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const category = form.category.value;
    const description = form.description.value;
    const price = parseFloat(form.price.value);
    const quantity = parseInt(form.quantity.value);
    const imageFile = form.image.files[0];

    let imageLink = plant.image; // Use existing image if none selected

    // ✅ Upload image to IMGBB if a new file is selected
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const { data } = await imagebb(formData); // Assuming imagebb returns { data: { url: '...' } }
        imageLink = data?.data?.url;
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error("Image upload failed.");
        return;
      }
    }

    const updateData = {
      name,
      category,
      description,
      image: imageLink || plant.image,
      price,
      quantity,
    };
    console.log(updateData)

    // ✅ Trigger the mutation
    updatePlant(updateData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsEditModalOpen(false)}
      >
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
                  Update Plant Info
                </DialogTitle>

                <div className="mt-2 w-full">
                  <UpdatePlantForm
                    plant={plant}
                    handleUpdate={handleUpdate}
                    isLoading={isLoading}
                  />
                </div>

                <hr className="mt-8" />
                <div className="mt-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

UpdatePlantModal.propTypes = {
  setIsEditModalOpen: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  plant: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
};

export default UpdatePlantModal;
