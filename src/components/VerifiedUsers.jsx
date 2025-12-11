import { useEffect, useState, useMemo } from "react";

const VerifiedUsers = () => {
  const [users, setUsers] = useState([]);
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // --------------------------------------------------
  // Fetch API + Fallback Logic
  // --------------------------------------------------
  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      // Filter verified users
      setUsers(data.filter((u) => u.isVerified === true));
      setApiStatus("API Connected");
    } catch (err) {
      console.warn("API failed. Loading fallback usersData.json");

      try {
        const res2 = await fetch("MarkwaveDashboard/usersData.json");
        if (!res2.ok) throw new Error("Fallback missing");

        const json = await res2.json();
        const verified = (json.users || []).filter((u) => u.isVerified === true);

        setUsers(verified);
        setApiStatus("Using Local JSON");
      } catch (e) {
        console.error("Fallback failed:", e);
        setApiStatus("No API / No JSON");
        setUsers([]);
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --------------------------------------------------
  // Sorting Logic
  // --------------------------------------------------
  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // --------------------------------------------------
  // Search + Sort Computation
  // --------------------------------------------------
  const filteredUsers = useMemo(() => {
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

  return (
    <div className="px-5 pb-5 w-fit overflow-auto pt-5">

      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">Verified Users</h2>

        {/* Right side Search + Refresh */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded w-40 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="px-3 py-1 bg-green-700 text-white text-sm rounded"
            onClick={() => {
              setSearch("");
              loadUsers();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* <div className="mb-2 text-sm text-gray-600">{apiStatus}</div> */}

      <table className="w-[1200px] border bg-white">
        <thead className="bg-green-700 text-white">
          <tr>
            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("firstName")}
            >
              First Name {sortField === "firstName" ? (sortAsc ? "▲" : "▼") : ""}
            </th>

            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("lastName")}
            >
              Last Name {sortField === "lastName" ? (sortAsc ? "▲" : "▼") : ""}
            </th>

            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("mobile")}
            >
              Mobile {sortField === "mobile" ? (sortAsc ? "▲" : "▼") : ""}
            </th>

            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("dob")}
            >
              DOB {sortField === "dob" ? (sortAsc ? "▲" : "▼") : ""}
            </th>

            <th className="p-2">Aadhaar</th>
            <th className="p-2">Referred by (Mobile)</th>
            <th className="p-2">Referred by (Name)</th>
            <th className="p-2">isVerified</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={8} className="border p-4 text-center text-[17px]">
                No verified users found
              </td>
            </tr>
          )}

          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-b hover:bg-green-50">
              <td className="p-2 text-center">{user.firstName}</td>
              <td className="p-2 text-center">{user.lastName}</td>
              <td className="p-2 text-center">{user.mobile}</td>
              <td className="p-2 text-center">{user.dob}</td>
              <td className="p-2 text-center">{user.adhaar}</td>
              <td className="p-2 text-center">{user.refMobile}</td>
              <td className="p-2 text-center">{user.refName}</td>
              <td className="p-2 text-center text-green-700 font-semibold">
                Verified
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerifiedUsers;
