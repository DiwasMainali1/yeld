import { useState } from "react";
import { Lock } from "lucide-react";

const ChangePasswordModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Change Password Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
      >
        <Lock size={20} />
        Change Password
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md space-y-4 border border-zinc-800 shadow-lg shadow-black/30">
            <h2 className="text-white text-xl font-bold mb-4">Change Password</h2>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="bg-zinc-700 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordModal;
