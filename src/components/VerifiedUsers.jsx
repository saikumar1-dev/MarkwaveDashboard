import { useEffect, useState } from "react";

const VerifiedUsers = () => {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/users?isVerified=true")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className=" px-5 pb-5 w-fit overflow-auto">
      <h2 className="text-xl font-semibold mb-4">
        Verified Users
      </h2>

      <table className="w-[1200px] border bg-white">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="p-2">First Name</th>
            <th className="p-2">Last Name</th>
            <th className="p-2">Mobile</th>
            <th className="p-2">DOB</th>
            <th className="p-2">Aadhaar</th>
            <th className="p-2">Referred by(Mobile)</th>
            <th className="p-2">Referred by(Name)</th>
            <th className="p-2">isVerified</th>
          </tr>
        </thead>

        <tbody>
            {
            users.length==0 && (
                <tr >
                    <td colSpan={9} className="border-2 p-4 text-[17px] border-gray-500">no data found</td>
                </tr>
            ) 
        }
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-green-50">
              <td className="p-2 text-center">{user.firstName}</td>
              <td className="p-2 text-center">{user.lastName}</td>
              <td className="p-2 text-center">{user.mobile}</td>
              <td className="p-2 text-center">{user.dob}</td>
              <td className="p-2 text-center">{user.adhaar}</td>
              <td className="p-2 text-center">{user.refMobile}</td>
              <td className="p-2 text-center">{user.refName}</td>
              <td className="p-2 text-center">{user.isVerified?'verified':''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerifiedUsers;
