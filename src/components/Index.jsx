import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import AddUser from './AddUser';
import Header from './Header';
import UsersTable from './UsersTable';
import VerifiedUsers from './VerifiedUsers';
import BuffaloManager from './BuffaloManager';
import BuffaloTree from './BuffaloTree';
import Logout from './Logout';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [addUser, setAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [btnState, setBtnState] = useState('referred');
  const [apiStatus, setApiStatus] = useState('API not connected');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fallbackURL = `${import.meta.env.BASE_URL}/usersData.json`;
  // console.log(`${import.meta.env.BASE_URL}/usersData.json`);
  const [form, setForm] = useState({
    mobile: "",
    firstName: "",
    lastName: "",
    dob: "",
    adhaar: "",
    refMobile: "",
    refName: "",
    isVerified: false
  });

  const refreshUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setUsers(data);
      setApiStatus("API Connected");
      return;
    } catch (err) {
      console.warn("API failed, using fallback usersData.json...");

      // FALLBACK to public/usersData.json
      try {
       
        console.log("Loading fallback JSON from:", fallbackURL);

        const res = await fetch(fallbackURL);
        if (!res.ok) throw new Error("Fallback JSON missing: " + res.status);

        const json = await res.json();
        setUsers(json.users || []);
        setApiStatus("Using Local JSON");
      } catch (fallbackErr) {
        console.error("Fallback JSON load failed:", fallbackErr);
        // setApiStatus("No API / No Local JSON");
      }
    }
  };

  useEffect(
    ()=>{refreshUsers()},[apiStatus]
  )
  const verifyApi = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      setApiStatus(res.ok ? "API Connected" : "API responded but failed");
    } catch {
      setApiStatus("API not reachable");
    }
  };

 
  const addReferral = async (userData) => {
    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!res.ok) throw new Error();
      refreshUsers();
    } catch {
      alert("API offline. Cannot add user.");
    }
  };

  const updateUser = async (data) => {
    try {
      await fetch(`http://localhost:3001/users/${form.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      refreshUsers();
    } catch {
      alert("API offline. Cannot update user.");
    }
  };

  const handleDelete = async (e) => {
    const id = e.target.id;
if(apiStatus!='API Connected'){
  setUsers(users.filter(u=>u.id!=id))
} else{
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error();
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      // alert("API offline. Cannot delete user.");
    }
  }
  };

  // -------------------------------------------------------------------
  // INIT LOAD
  // -------------------------------------------------------------------
  useEffect(() => {
    refreshUsers();
  }, []);

  useEffect(() => {
    verifyApi();
  }, []);

  return (
    <>
      {!isLogin && <LoginPage setIsLogin={setIsLogin} />}

      {isLogin && (
        <div>
          {/* Floating Add Button */}
          {btnState === "referred" && (
            <button
              onClick={() => setAddUser(true)}
              className='fixed top-147 z-1 right-6 text-green-900 w-15 h-15 text-5xl flex justify-center rounded-full bg-green-100 p-0 hover:bg-green-200'
            >
              +
            </button>
          )}

          {/* Header */}
          <div className='fixed w-screen bg-green-50 shadow-[1px_1px_5px_rgba(0,0,0,0.5)] top-0'>
            <Header
              apiStatus={apiStatus}
              verifyApi={verifyApi}
              btnState={btnState}
              setBtnState={setBtnState}
              setIsLogin={setIsLogin}
              setShowLogoutConfirm={setShowLogoutConfirm}
            />
          </div>

          {/* Referred Users Table */}
          {isLogin && btnState === "referred" && (
            <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
              <div className="w-fit md:h-[80vh] h-[70vh] overflow-y-auto">
                <UsersTable 
                    users={users}
                    setForm={setForm}
                    setAddUser={setAddUser}
                    handleDelete={handleDelete}
                    onRefresh={refreshUsers}
                    setUsers={setUsers}
                  />
              </div>
            </div>
          )}

          {/* Verified Users */}
          {isLogin && btnState === "verified" && (
            <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
              <div className="w-fit md:h-[80vh] h-[70vh] overflow-y-auto">
                <VerifiedUsers 
                fallbackURL={fallbackURL}
                refreshUsers={refreshUsers}
                users={users}
                setUsers={setUsers}
                />
              </div>
            </div>
          )}

          {/* Buffalo Manager */}
          {isLogin && btnState === "products" && (
            <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
              <div className="w-full md:h-[80vh] h-[70vh] overflow-y-auto">
                <BuffaloManager 
                apiStatus={apiStatus} 
                verifyApi={verifyApi} 
                />
              </div>
            </div>
          )}

          {/* Buffalo Tree */}
          {isLogin && btnState === "tree" && (
            <div className="fixed top-49 md:top-35 left-0 w-screen h-screen flex justify-center items-start">
              <div className="w-full md:h-[80vh] h-[70vh] overflow-y-auto">
                <BuffaloTree />
              </div>
            </div>
          )}

          {/* Add User Panel */}
          {isLogin && addUser && (
            <div className='fixed top-0 z-10 fade-out right-0'>
              <AddUser
                setAddUser={setAddUser}
                addReferral={addReferral}
                apiStatus={apiStatus}
                verifyApi={verifyApi}
                form={form}
                setForm={setForm}
                updateUser={updateUser}
                users={users}
                setUsers={setUsers}
              />
            </div>
          )}

          {/* Logout Popup */}
          {showLogoutConfirm && (
            <Logout
              setIsLogin={setIsLogin}
              setShowLogoutConfirm={setShowLogoutConfirm}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Index;
