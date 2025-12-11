import React from 'react'

const Logout = ({setShowLogoutConfirm,setIsLogin}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Background */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowLogoutConfirm(false)}
    />

    {/* Popup Box */}
    <div className="relative bg-white w-72 p-5 rounded-lg shadow-lg z-10">
      <p className="text-slate-800 text-base mb-6">
        Are you sure you want to logout?
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-1 border rounded text-slate-700 hover:bg-slate-100"
          onClick={() => {
            setShowLogoutConfirm(false);
            console.log("Logout cancelled"); // returns false
          }}
        >
          Cancel
        </button>

        <button
          className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            setShowLogoutConfirm(false);
            setIsLogin(false); // your logout logic (TRUE)
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
  )
}

export default Logout
