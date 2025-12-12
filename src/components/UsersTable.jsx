import React, { useState, useMemo } from "react";

export default function UsersTable({
  users,
  setForm,
  setAddUser,
  handleDelete,
  onRefresh,
  apiStatus,
  setUsers
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
  });

  // SHOW POPUP
  const showPopup = (title, message, onConfirm = null, confirmText = "OK") => {
    setPopup({ show: true, title, message, onConfirm, confirmText });
  };

  // CLOSE POPUP
  const closePopup = () => {
    setPopup({ show: false, title: "", message: "", onConfirm: null });
  };

  // ----------------------------
  // Edit handler
  // ----------------------------
  const editUser = (e) => {
    setAddUser(true);
    setForm(users[e.target.id]);
    
  };

  // ----------------------------
  // Sorting Logic
  // ----------------------------
  const sortedUsers = useMemo(() => {
    let data = [...users];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.firstName.toLowerCase().includes(s) ||
          u.lastName.toLowerCase().includes(s) ||
          u.mobile.includes(s)
      );
    }

    if (sortField) {
      data.sort((a, b) => {
        let v1 = a[sortField] || "";
        let v2 = b[sortField] || "";

        if (sortField === "firstName") {
          v1 = `${a.firstName} ${a.lastName}`.toLowerCase();
          v2 = `${b.firstName} ${b.lastName}`.toLowerCase();
        }

        return sortAsc ? v1.localeCompare(v2) : v2.localeCompare(v1);
      });
    }

    return data;
  }, [users, search, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // ----------------------------
  // Delete Handler with Popup
  // ----------------------------
  const handleDeletePopup = (id) => {
    showPopup(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      () => {
        closePopup();
        handleDelete({ target: { id } });
      },
      "Delete"
    );
  };

  return (
    <div className="w-fit p-5 pt-5">
      {/* Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white w-80 rounded shadow-lg p-5">
            <h3 className="text-lg font-semibold mb-2">{popup.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{popup.message}</p>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={closePopup}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={popup.onConfirm}
              >
                {popup.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">Referred Users</h2>

        {/* Right-side Search + Refresh */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded w-36 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
            onClick={() => {
              setSearch("");
              onRefresh && onRefresh();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <table className="w-[1200px] border border-gray-300 shadow-md animate-fade">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 cursor-pointer" onClick={() => toggleSort("firstName")}>
              Full Name {sortField === "firstName" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th className="py-2 px-4 cursor-pointer" onClick={() => toggleSort("mobile")}>
              Mobile {sortField === "mobile" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th className="py-2 px-4 cursor-pointer" onClick={() => toggleSort("dob")}>
              DOB {sortField === "dob" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th className="py-2 px-4">Adhaar No</th>
            <th className="py-2 px-4">Referred By (Name)</th>
            <th className="py-2 px-4">Referred By (Mobile)</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="border p-4 text-[17px] border-gray-500 text-center"
              >
                No data found
              </td>
            </tr>
          )}

          {sortedUsers.map((u, i) => (
            <tr key={i} className="border-b hover:bg-blue-50 transition-all">
              <td className="py-2 px-4 text-center capitalize">
                {u.firstName + " " + u.lastName}
              </td>
              <td className="py-2 px-4 text-center">{u.mobile}</td>
              <td className="py-2 px-4 text-center">{u.dob}</td>
              <td className="py-2 px-4 text-center">{u.adhaar}</td>
              <td className="py-2 px-4 text-center">{u.refName}</td>
              <td className="py-2 px-4 text-center">{u.refMobile}</td>

              <td className="py-2 px-4 text-center min-w-[200px]">
                <button
                  className="px-3 border bg-green-100 text-green-700"
                  id={i}
                  onClick={editUser}
                >
                  Edit
                </button>

                <button
                  className="px-3 border ml-2 bg-red-100 text-red-500"
                  onClick={() => handleDeletePopup(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
