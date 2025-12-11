import React, { useEffect, useState } from 'react'
import LoginPage from './LoginPage';
import AddUser from './AddUser';
import Header from './Header';
import UsersTable from './UsersTable';
import VerifiedUsers from './VerifiedUsers';
import BuffaloManager from './BuffaloManager';
import BuffaloTree from './BuffaloTree';
import Logout from './Logout';

const Index = () => {
    const [isLogin,setIsLogin]=useState(true);
    const [addUser,setAddUser]=useState(false);
    const [ users , setUsers] = useState([]);
    const [btnState,setBtnState]=useState('referred');
    const [apiStatus,setApiStatus] = useState('API not connected');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [form, setForm] = useState({
    mobile:"",
    firstName:"",
    lastName:"",
    dob:"",
    adhaar:"",
    refMobile:"",
    refName:"",
    isVerified:false
  });
useEffect(
  ()=>{
    refreshUsers();
  },[apiStatus]
)
  const refreshUsers = async () => {
  const res = await fetch("http://localhost:3001/users");
  const data = await res.json();
  setUsers(data);
  };

      const addReferral = async (userData) => {
      await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      refreshUsers(); 
      };
      const updateUser=async(data)=>{
    await fetch(`http://localhost:3001/users/${form.id}`,{
      method:"put",
      headers:{"content-type":"application/json"},
      body: JSON.stringify(data)
    });
    refreshUsers();
  }

  const handleDelete = async (e) => {
    const id=e.target.id;
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    const res = await fetch(`http://localhost:3001/users/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Delete failed");
    setUsers(prev => prev.filter(u => u.id !== id));
  } catch (err) {
    console.log(err.message);
  }
};

useEffect(() => {
  refreshUsers();
}, []);

useEffect(()=>{
  verifyApi()
},[]);
  const verifyApi = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      if(res.ok){
        setApiStatus("API Connected");
      } else {
        setApiStatus("API responded but failed");
      }
    } catch(err){
      setApiStatus("API not reachable");
    }
  };

  return (
  <>
    {!isLogin && (
    <LoginPage 
    setIsLogin={setIsLogin}/>
)}
{
  isLogin && (
    <div>
    {btnState=='referred'&&(<button onClick={()=>setAddUser(true)} className='fixed top-139 z-1 right-10 text-green-900 w-15 h-15 text-5xl flex justify-center rounded-full bg-green-100 p-0 hover:bg-green-200'>
      +
    </button>)}
    {/* add referral component */}
  
          {/* head controls */}
    <div className=' fixed w-screen bg-green-50 shadow-[1px_1px_5px_rgba(0,0,0,0.5)] top-0'>
    <Header 
    apiStatus={apiStatus} 
    verifyApi={verifyApi} 
    btnState={btnState} 
    setBtnState={setBtnState}
    setIsLogin={setIsLogin}
    setShowLogoutConfirm={setShowLogoutConfirm}
    />
    
    </div>

    {/* referral table component */}
    <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
  <div className="w-fit md:h-[80vh] h-[70vh] overflow-y-auto ">
    {btnState === "referred" && (
      <UsersTable 
        users={users}
        setForm={setForm}
        setAddUser={setAddUser}
        handleDelete={handleDelete}
      />
    )}
  </div>
</div>
    </div>
  )
}
{
  isLogin && btnState=='verified'&&(
    <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
  <div className="w-fit md:h-[80vh] h-[70vh] overflow-y-auto ">
      <VerifiedUsers/>
    </div>
    </div>
  )
}
{
  isLogin && btnState=='products'&&(
    <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
  <div className="w-full md:h-[80vh] h-[70vh] overflow-y-auto ">
      <BuffaloManager
      apiStatus={apiStatus} 
    verifyApi={verifyApi}
      />
    </div>
    </div>
  )
}
{
  isLogin && btnState=='tree'&&(
    <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
  <div className="w-full md:h-[80vh] h-[70vh] overflow-y-auto ">
      <BuffaloTree/>
    </div>
    </div>
  )
}
{
  isLogin && addUser &&
  <div className='fixed top-0 z-10 fade-out right-0'>
    {/* form for add referral */}
      <AddUser 
        setAddUser={setAddUser}
        addReferral={addReferral} 
        apiStatus={apiStatus} 
        verifyApi={verifyApi} 
        form={form} 
        setForm={setForm} 
        updateUser={updateUser} />
      </div>
}
{showLogoutConfirm && (
  <Logout 
  setIsLogin={setIsLogin} 
  setShowLogoutConfirm={setShowLogoutConfirm}
  />
)}
</>
)
}

export default Index
