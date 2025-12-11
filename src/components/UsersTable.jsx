import React from "react";

export default function UsersTable({ users,setForm,setAddUser,handleDelete}) {
    const aa=(e)=>{
        // console.log('edit clicked')
        // console.log(e.target)
        // console.log(users[e.target.id])
        setAddUser(true)
        setForm(users[e.target.id])
    }
  return (
    <div className=" w-fit p-5 pt-0">
      <h2 className="text-xl font-semibold mb-4">
        Referred Users
      </h2>
      <table className=" w-[1200px] border border-gray-300 shadow-md animate-fade">
        <thead className="bg-blue-600 text-white">
          <tr>
            {/* <th className="py-2 px-4 ">ID</th> */}
            <th className="py-2 px-4">Full Name</th>
            <th className="py-2 px-4">Mobile</th>
            <th className="py-2 px-4">DOB</th>
            <th className="py-2 px-4">Adhaar No</th>
            <th className="py-2 px-4">Referred By (Name)</th>
            <th className="py-2 px-4">Referred By (Mobile)</th>
            <th className="py-2 px-4"></th>
            
          </tr>
        </thead>

        <tbody>
        {
            users.length==0 && (
                <tr >
                    <td colSpan={8} className="border-2 p-4 text-[17px] border-gray-500">no data found</td>
                </tr>
            ) 
        }
          {users?.map((u, i) => (
            <tr
              key={i}
              className="border-b hover:bg-blue-50 transition-all "
            >
              {/* <td className="py-2 px-4 text-center">{u.id}</td> */}
              <td className="py-2 px-4 text-center capitalize">{u.firstName+' '+u.lastName}</td>
              <td className="py-2 px-4 text-center">{u.mobile}</td>
              <td className="py-2 px-4 text-center">{u.dob}</td>
              <td className="py-2 px-4 text-center">{u.adhaar}</td>
              <td className="py-2 px-4 text-center">{u.refName}</td>
              <td className="py-2 px-4 text-center">{u.refMobile}</td>
              <td className="py-2 px-4 text-center min-w-[200px]">
                <button className=" px-3 border bg-green-100 text-green-700" id={i} onClick={aa}>
                    Edit
                </button>
                <button className=" px-3 border ml-2 bg-red-100 text-red-500" id={u.id} onClick={handleDelete}>
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
