const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          Confirm {itemType === "post" ? "Post" : "Comment"} Deletion
        </h2>
        <p>
          Are you sure you want to delete this{" "}
          {itemType === "post" ? "post" : "comment"}?
        </p>
        <div className="flex justify-between mt-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
