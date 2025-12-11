import { useState } from "react";

const AddUser = ({setAddUser,addReferral,apiStatus,verifyApi,form,setForm,updateUser}) => {

  const [errors, setErrors] = useState({});
const duplicate={
    mobile:"",
    firstName:"",
    lastName:"",
    dob:"",
    adhaar:"",
    refMobile:"",
    refName:"",
    isVerified:false
  }
  
  const handleChange = (e)=>{
    setForm({...form, [e.target.name]: e.target.value});
    setErrors({...errors, [e.target.name]:""});
  };
  const calculateAge = (dob)=>{
    if(!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validate = ()=>{
    let err = {};

    if(!form.mobile){
      err.mobile = "Required";
    } else if(form.mobile.length !== 10 || !/^[0-9]+$/.test(form.mobile)){
      err.mobile = "10 digits";
    }

    if(!form.firstName) err.firstName = "Required";
    if(!form.lastName) err.lastName = "Required";

    const age = calculateAge(form.dob);
    if(!form.dob){
      err.dob = "Required";
    } else if(age < 21){
      err.dob = "Must be 21+";
    }

    if(!form.adhaar){
      err.adhaar="Required";
    } else if(form.adhaar.length !== 12 || !/^[0-9]+$/.test(form.adhaar)){
      err.adhaar="12 digits";
    }

    if(!form.refMobile){
      err.refMobile="Required";
    } else if(form.refMobile.length !== 10 || !/^[0-9]+$/.test(form.refMobile)){
      err.refMobile="10 digits must";
    }

    if(!form.refName) err.refName="Required";

    return err;
  };

  const onSubmit = (e)=>{
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if(Object.keys(validationErrors).length>0) return;
    verifyApi();
    if (apiStatus!='API Connected') {
    alert("API Not Connected. Please check.");
    return;
  } 
    if(form.id)
      updateUser(form)
    else
    addReferral(form);
    setAddUser(false)
    setForm(duplicate);
  };

  const fieldClass = (key)=>(
    `block rounded p-1 w-full border ${errors[key] ? "border-red-500" : "border-gray-400"}`
  );

  return (
    <div className='w-[450px] px-12 py-5 rounded bg-gray-300 h-screen'>
      <form
        onSubmit={onSubmit}
        className='bg-white flex flex-col items-center px-10 mt-4 py-5 rounded gap-2 w-full'
        style={{boxShadow:'2px 2px 5px black'}}
      >
        <button
          type="button"
          onClick={()=>{setAddUser(false);
            setForm(duplicate)}}
          className="absolute right-3 top-3 text-gray-600 text-xl font-bold hover:text-red-600"
        >       
          ×
        </button>
        <div>
          <h1 className='text-2xl text-blue-600'>
            Add New User
          </h1>
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Mobile No :</label>
            <span className='text-red-600 text-[11px]'>{errors.mobile}</span>
          </div>
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            className={fieldClass("mobile")}
            maxLength={10}
            disabled={form.id}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>First Name :</label>
            <span className='text-red-600 text-[11px]'>{errors.firstName}</span>
          </div>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className={fieldClass("firstName")}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Last Name :</label>
            <span className='text-red-600 text-[11px]'>{errors.lastName}</span>
          </div>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className={fieldClass("lastName")}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Date of birth :</label>
            <span className='text-red-600 text-[11px]'>{errors.dob}</span>
          </div>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className={fieldClass("dob")}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Adhaar No :</label>
            <span className='text-red-600 text-[11px]'>{errors.adhaar}</span>
          </div>
          <input
            name="adhaar"
            value={form.adhaar}
            onChange={handleChange}
            className={fieldClass("adhaar")}
            maxLength={12}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Referred By (Mobile) :</label>
            <span className='text-red-600 text-[11px]'>{errors.refMobile}</span>
          </div>
          <input
            name="refMobile"
            value={form.refMobile}
            onChange={handleChange}
            className={fieldClass("refMobile")}
            maxLength={10}
            disabled={form.id}
          />
        </div>

        <div className='w-full'>
          <div className='flex justify-between items-center'>
            <label>Referred By (Name) :</label>
            <span className='text-red-600 text-[11px]'>{errors.refName}</span>
          </div>
          <input
            name="refName"
            value={form.refName}
            onChange={handleChange}
            className={fieldClass("refName")}
          />
        </div>

        <div className='w-full mt-3'>
          <button type="submit"
            className='w-full border border-blue-400 bg-blue-100 py-3 rounded'
          >
            Submit
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddUser;
