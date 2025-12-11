import React, { useState } from 'react'
import refresh from '../../public/refresh.png'
import logout from '../../public/logout.png'
import logo from '../../public/markwave logo.jpg'

const Header = ({apiStatus,verifyApi,btnState,setBtnState,setIsLogin,setShowLogoutConfirm}) => {
   const [rotating, setRotating] = useState(false);
   


const handleRefresh = () => {
  setRotating(true);
  verifyApi()
  setTimeout(()=>setRotating(false),1500);
};

  return (
    <div>
      <div className='absolute'>
        <img src={logo} alt="" className=' ml-5 w-17 h-17 rounded-full'/>
      </div>
        <div className={` py-2 px-5 ml-auto w-fit mt-4 mr-15 border rounded ${apiStatus=='API Connected'?'text-green-900': 'text-red-500'}`}>
            <button onClick={()=>handleRefresh()}>{apiStatus}
            <img src={refresh} alt="" className={`inline ml-2 w-5 h-5 ${rotating && 'animation-rot'}`}/>
            </button>
            
        </div>
        <div>
          <button
            className="w-6 h-6 inline absolute top-5 right-6"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <img src={logout} alt="logout" />
            <p className="text-[13px] -ml-1">logout</p>
          </button>
        </div>

      <div className='-mt-5 sm:-mt-15'>
        <h1 className='pl-5 p-2 text-2xl text-blue-600 text-center mt-5 [font-variant-caps:small-caps]'>Markwave India DashBoard</h1>
      </div>
      <div className=' border-gray-300 flex justify-center rounded'>
        <div className='p-3 flex gap-7 rounded mb-2'>
        <button className={`px-3 py-1 rounded shadow-[1px_1px_3px_black] border ${btnState=='referred'?'border-blue-500 bg-blue-100 text-blue-600':''}`} onClick={()=>setBtnState('referred')} >Referral</button>
        <button className={`px-3 py-1 rounded shadow-[1px_1px_3px_black] border ${btnState=='verified'?'border-blue-500 bg-blue-100 text-blue-600':''}`} onClick={()=>setBtnState('verified')} >Verified users</button>
        <button className={`px-3 py-1 rounded shadow-[1px_1px_3px_black] border ${btnState=='tree'?'border-blue-500 bg-blue-100 text-blue-600':''}`} onClick={()=>setBtnState('tree')}      >Buffalo Tree</button>
        <button className={`px-3 py-1 rounded shadow-[1px_1px_3px_black] border ${btnState=='products'?'border-blue-500 bg-blue-100 text-blue-600':''}`} onClick={()=>setBtnState('products')} >Products</button>
        </div>
      </div>
      
    </div>
  )
}

export default Header
