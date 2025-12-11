import React, { useState } from "react";

const LoginPage = ({ isLogin, setIsLogin }) => {
  const login = {
    username: "admin",
    password: "Markwave@2025",
  };

  const [details, setDetails] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState({
    username: false,
    password: false,
  });

  const validate = () => {
    let isValid = true;
    let newErrors = { username: false, password: false };

    if (details.username !== login.username) {
      newErrors.username = true;
      isValid = false;
    }

    if (details.password !== login.password) {
      newErrors.password = true;
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setDetails({
      username: "",
      password: "",
    });
    if (!validate()) return;
    setIsLogin(true);
    
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setDetails((prev) => ({ ...prev, [name]: value }));

    // Clear error live while typing
    setError((prev) => ({ ...prev, [name]: false }));
  };

  return (
    <div className="flex justify-center h-screen">
        <div className=" px-10 py-10 mt-30 shadow-xl h-fit rounded-2xl w-[400px] z-10 bg-gray-100 " style={{boxShadow:'2px 2px 5px black'}}>
          <div className="flex wrap-normal flex-col justify-center items-center">
            <img
              src="../../public/markwave logo.jpg"
              alt="logo"
              className="h-20 w-20 rounded-full "
            />
            <h1 className="text-2xl text-blue-600 ml-3 mt-5">Markwave India</h1>
          </div>

          <form className="mt-4" onSubmit={onSubmit}>
            {/* Username */}
            <div className="relative">
              <input
              id="uname"
                type="text"
                name="username"
                placeholder=" "
                className={`peer w-full border-b-2 pt-4 pb-2 outline-none ${
                  error.username ? "border-red-500" : ""}`}
                value={details.username}
                onChange={onChange}
              />

              <label
              htmlFor="uname"
                className={` absolute left-0 top-5 transition-all
                  peer-focus:top-0 peer-focus:text-xs
                  peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs 
                ${error.username ? "text-red-400" : ""}`}
              >
                User Name
              </label>
            </div>

            {/* Password */}
            <div className="relative mt-4">
              <input
              id="password"
                type="password"
                name="password"
                placeholder=" "
                className={`peer w-full border-b-2 pt-4 pb-2 outline-none mb-5 ${
                  error.password ? "border-red-400" : ""
                }`}
                value={details.password}
                onChange={onChange}
              />

              <label
              htmlFor="password"
                className={`
                  absolute left-0 top-5 transition-all
                  peer-focus:top-0 peer-focus:text-xs
                  peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs
                ${error.password ? "text-red-400" : ""}`}
              >
                Password
              </label>
            </div>
            {/* submit btn */}
            <div className="flex justify-center">
              <input type="submit" className="px-3 border border-blue-400 rounded bg-blue-200 text-xl w-full py-2 mt-3" />
            </div>
          </form>
        </div>
    </div>
  );
};

export default LoginPage;

