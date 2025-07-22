// // // src/components/VerifyPhone.jsx

// // import React, { useState } from 'react';
// // import { getBackendUrl } from '../utils/urlUtils';
// // import { useNavigate } from 'react-router-dom'; // Keep useNavigate for other potential uses, but not for final OTP redirect

// // const VerifyPhone = () => {
// //   const [phoneNumber, setPhoneNumber] = useState('');
// //   const [otp, setOtp] = useState('');
// //   const [stage, setStage] = useState('submitPhone'); // 'submitPhone' | 'verifyOtp'
// //   const [error, setError] = useState('');
// //   const navigate = useNavigate(); // Still needed if you use it for other navigations
// //   const backendUrl = getBackendUrl();

// //   const handleSubmitPhone = async () => {
// //     setError('');
// //     try {
// //       const res = await fetch(`${backendUrl}/api/auth/submit-phone`, {
// //         method: 'POST',
// //         credentials: 'include',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ phoneNumber }),
// //       });

// //       if (!res.ok) {
// //         const data = await res.json();
// //         throw new Error(data.message || 'Failed to send OTP');
// //       }

// //       setStage('verifyOtp');
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   const handleVerifyOtp = async () => {
// //     setError('');
// //     try {
// //       const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
// //         method: 'POST',
// //         credentials: 'include',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ otp }),
// //       });

// //       if (!res.ok) {
// //         const data = await res.json();
// //         throw new Error(data.message || 'OTP verification failed');
// //       }

// //       // --- CRITICAL CHANGE START ---
// //       const data = await res.json(); // Parse the JSON response from the backend
// //       if (data.success && data.redirectTo) {
// //         // Perform a full browser redirect using window.location.href
// //         // This causes a full page reload, allowing useAutodeskAuth to correctly
// //         // detect the 'authStatus=success' from the URL query parameters.
// //         window.location.href = data.redirectTo;
// //       } else {
// //         // Fallback error if backend didn't provide expected redirect info
// //         throw new Error(data.message || 'OTP verification success, but no redirect information received.');
// //       }
// //       // --- CRITICAL CHANGE END ---

// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   return (
// //     <div className="p-6 max-w-md mx-auto">
// //       <h2 className="text-xl font-semibold mb-4">Verify Your Phone</h2>
// //       {stage === 'submitPhone' && (
// //         <>
// //           <input
// //             type="tel"
// //             value={phoneNumber}
// //             placeholder="Enter phone number"
// //             onChange={(e) => setPhoneNumber(e.target.value)}
// //             className="w-full mb-2 p-2 border rounded"
// //           />
// //           <button type='button' onClick={handleSubmitPhone} className="w-full bg-blue-600 text-white py-2 rounded">
// //             Send OTP
// //           </button>
// //         </>
// //       )}

// //       {stage === 'verifyOtp' && (
// //         <>
// //           <input
// //             type="text"
// //             value={otp}
// //             placeholder="Enter OTP"
// //             onChange={(e) => setOtp(e.target.value)}
// //             className="w-full mb-2 p-2 border rounded"
// //           />
// //           <button type='button' onClick={handleVerifyOtp} className="w-full bg-green-600 text-white py-2 rounded">
// //             Verify OTP
// //           </button>
// //         </>
// //       )}

// //       {error && <p className="text-red-500 mt-4">{error}</p>}
// //     </div>
// //   );
// // };

// // export default VerifyPhone;


// // src/components/VerifyPhone.jsx

// import React, { useState, useEffect } from 'react';
// import { getBackendUrl } from '../utils/urlUtils';
// import { useNavigate } from 'react-router-dom';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css'; // Make sure this is imported!
// import logo from '../assets/companylogos/5dvdc_white.svg';

// const VerifyPhone = () => {
//   const [userDetails, setUserDetails] = useState(null);

//   const getUserDetails = async () => {
//     try {
//       const res = await fetch(`${getBackendUrl()}/api/auth/pending-user-details`, {
//         method: 'GET',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || 'Failed to fetch user details');
//       }

//       const data = await res.json();
//       return data;
//   }

//   catch (err) {
//     console.error('Failed to fetch user details:', err);
//     return null;
//   }
// };
//   console.log(getUserDetails());

//   const [otp, setOtp] = useState(Array(6).fill('')); // For 6 digit OTP
//   // Stage management:
//   // 'inputPhone': User is entering/editing phone number, OTP section is hidden.
//   // 'otpSent': Phone number is disabled, OTP section is visible.
//   const [stage, setStage] = useState('inputPhone');
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [formErrors, setFormErrors] = useState({}); // For client-side validation errors
//   const [serverError, setServerError] = useState(''); // For backend errors
//   const navigate = useNavigate();
//   const backendUrl = getBackendUrl();

//   // Handle changes for disabled fields (though they are disabled, keeps structure consistent)
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUserDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   // Handle phone input changes (from react-phone-input-2)
//   const handlePhoneInputChange = (phone, country) => {
//     setUserDetails((prevDetails) => ({
//       ...prevDetails,
//       phoneNumber: phone,
//       countryCode: country.dialCode,
//     }));
//     // Clear phone number error when user starts typing
//     if (formErrors.phoneNumber) {
//       setFormErrors(prev => ({ ...prev, phoneNumber: '' }));
//     }
//   };

//   // Handle individual OTP input changes
//   const handleOtpChange = (e, index) => {
//     const { value } = e.target;
//     // Allow only single digit numbers or empty string
//     if (/[0-9]/.test(value) || value === '') {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       // Move focus to next input if a digit is entered and not the last input
//       if (value && index < 5) {
//         document.getElementById(`otp-input-${index + 1}`).focus();
//       }
//       // Clear OTP error when user starts typing
//       if (formErrors.otp) {
//         setFormErrors(prev => ({ ...prev, otp: '' }));
//       }
//     }
//   };

//   // Handle backspace to move focus to previous OTP input
//   const handleOtpKeyDown = (e, index) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       document.getElementById(`otp-input-${index - 1}`).focus();
//     }
//   };

//   // Client-side validation for phone number and terms before sending OTP
//   const validateSubmitPhoneForm = () => {
//     const errors = {};
//     // Basic check for phone number format
//     if (!userDetails.phoneNumber || userDetails.phoneNumber.length < 5 || !/^\+?[0-9\s-()]+$/.test(userDetails.phoneNumber)) {
//         errors.phoneNumber = 'A valid phone number is required.';
//     }
//     if (!agreedToTerms) {
//       errors.agreedToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
//     }
//     setFormErrors(errors); // Set errors to display them
//     return Object.keys(errors).length === 0; // Return true if no errors
//   };

//   // Client-side validation for OTP before verification
//   const validateVerifyOtpForm = () => {
//     const errors = {};
//     const fullOtp = otp.join('');
//     if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
//       errors.otp = 'Please enter the complete 6-digit OTP.';
//     }
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmitPhone = async (e) => {
//     e.preventDefault(); // Prevent default form submission
//     setServerError(''); // Clear any previous server errors
//     setFormErrors({}); // Clear previous form errors

//     if (!validateSubmitPhoneForm()) {
//       return; // Stop if client-side validation fails
//     }

//     try {
//       const res = await fetch(`${backendUrl}/api/auth/submit-phone`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({

//           phoneNumber: userDetails.phoneNumber
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || 'Failed to send OTP');
//       }

//       setStage('otpSent'); // Change stage to show OTP and disable phone
//       // Optionally, alert user that OTP was sent
//       // alert('OTP sent successfully!');
//     } catch (err) {
//       setServerError(err.message);
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault(); // Prevent default form submission
//     setServerError(''); // Clear any previous server errors
//     setFormErrors({}); // Clear previous form errors

//     if (!validateVerifyOtpForm()) {
//       return; // Stop if client-side validation fails
//     }

//     try {
//       const fullOtp = otp.join(''); // Join the OTP array into a single string

//       const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ fullOtp }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || 'OTP verification failed');
//       }

//       // --- CRITICAL CHANGE START ---
//       const data = await res.json(); // Parse the JSON response from the backend
//       if (data.success && data.redirectTo) {
//         // Perform a full browser redirect using window.location.href
//         // This causes a full page reload, allowing useAutodeskAuth to correctly
//         // detect the 'authStatus=success' from the URL query parameters.
//         window.location.href = data.redirectTo;
//       } else {
//         // Fallback error if backend didn't provide expected redirect info
//         throw new Error(data.message || 'OTP verification success, but no redirect information received.');
//       }
//       // --- CRITICAL CHANGE END ---

//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   console.log(userDetails)

//   const handleEditPhone = () => {
//     setStage('inputPhone'); // Go back to phone input stage
//     setOtp(Array(6).fill('')); // Clear OTP field
//     setFormErrors({}); // Clear form errors
//     setServerError(''); // Clear server errors
//   };

//   return (
//     <div className="flex min-h-screen font-sans">
//       {/* Left Panel (60% width on medium screens and up, hidden on small) */}
//       <div className="hidden md:flex flex-col items-center p-5 bg-[#0D2C54] text-white w-3/5 shrink-0">
//         <div className="mt-12 text-center">
//           {/* Replace with your actual logo path */}
//           <img src={logo} alt="5DVC Learning Academy Logo" className="w-24 h-auto mx-auto" />
//           <p className="mt-2 text-lg font-semibold tracking-wider">LEARNING ACADEMY</p>
//         </div>
//       </div>

//       {/* Right Panel (40% width on medium screens and up, full width on small) */}
//       <div className="flex flex-1 items-center justify-center p-5 w-full md:w-2/5">
//         <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-lg">
//           <h2 className="text-3xl text-gray-800 mb-2 font-semibold">Get Started</h2>
//           <p className="text-gray-600 mb-8">Verify and Complete your Details</p>

//           <form onSubmit={stage === 'inputPhone' ? handleSubmitPhone : handleVerifyOtp}>
//             {/* First Name and Last Name on the same line */}
//             <div className="flex space-x-4 mb-5">
//               <div className="w-1/2">
//                 <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
//                   First Name:
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   name="firstName"
//                   value={userDetails.firstName}
//                   onChange={handleChange}
//                   disabled
//                   className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
//                 />
//               </div>

//               <div className="w-1/2">
//                 <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
//                   Last Name:
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   name="lastName"
//                   value={userDetails.lastName}
//                   onChange={handleChange}
//                   disabled
//                   className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
//                 />
//               </div>
//             </div>

//             <div className="mb-5">
//               <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
//                 Email Address:
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={userDetails.email}
//                 onChange={handleChange}
//                 disabled
//                 className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
//               />
//             </div>

//             {/* Phone Number Input and Edit Button */}
//             <div className="mb-5">
//               <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
//                 Phone Number:
//               </label>
//               <div className="flex items-center space-x-2"> {/* Flex container for phone input and edit button */}
//                 <div className="flex-grow"> {/* Allows PhoneInput to take available space */}
//                   <PhoneInput
//                     country={'in'}
//                     value={userDetails.phoneNumber}
//                     onChange={handlePhoneInputChange}
//                     inputProps={{
//                       name: 'phoneNumber',
//                       required: true,
//                       autoFocus: true,
//                       id: 'phoneNumber',
//                     }}
//                     inputStyle={{
//                       width: '100%',
//                       height: '48px',
//                       fontSize: '1em',
//                       border: formErrors.phoneNumber ? '1px solid red' : '1px solid #d1d5db',
//                       borderRadius: '0.375rem',
//                       paddingLeft: '52px',
//                     }}
//                     containerStyle={{ width: '100%' }}
//                     buttonStyle={{ borderRadius: '0.375rem 0 0 0.375rem', borderRight: '1px solid #d1d5db' }}
//                     enableSearch={true}
//                     placeholder="Enter phone number"
//                     dropdownStyle={{
//                       maxHeight: '200px',
//                       overflowY: 'auto',
//                     }}
//                     disabled={stage === 'otpSent'} // Disable when OTP is sent
//                   />
//                 </div>
//                 {stage === 'otpSent' && ( // Show edit button only when OTP is sent
//                   <button
//                     type="button" // Important: type="button" to prevent form submission
//                     onClick={handleEditPhone}
//                     className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 ease-in-out text-sm"
//                   >
//                     Edit
//                   </button>
//                 )}
//               </div>
//               {formErrors.phoneNumber && (
//                 <p className="text-red-500 text-xs italic mt-2">{formErrors.phoneNumber}</p>
//               )}
//             </div>

//             {/* Terms and Conditions (always visible) */}
//             <div className="mb-5 flex items-center">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={agreedToTerms}
//                 onChange={(e) => {
//                   setAgreedToTerms(e.target.checked);
//                   if (formErrors.agreedToTerms) {
//                     setFormErrors(prev => ({ ...prev, agreedToTerms: '' }));
//                   }
//                 }}
//                 className="mr-3 leading-tight text-blue-600 focus:ring-blue-500 h-4 w-4 rounded border-gray-300"
//               />
//               <label htmlFor="terms" className="text-gray-700 text-sm">
//                 I agree to the{' '}
//                 <a
//                   href="/terms-of-service"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline"
//                 >
//                   Terms of Service
//                 </a>{' '}
//                 &amp;{' '}
//                 <a
//                   href="/privacy-policy"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline"
//                 >
//                   Privacy Policy
//                 </a>
//               </label>
//             </div>
//             {formErrors.agreedToTerms && (
//               <p className="text-red-500 text-xs italic -mt-3 mb-5">{formErrors.agreedToTerms}</p>
//             )}

//             {/* Submit Phone / Send OTP Button (only visible when phone is editable) */}
//             {stage === 'inputPhone' && (
//               <button
//                 type="submit"
//                 disabled={!agreedToTerms}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Send OTP
//               </button>
//             )}

//             {/* OTP Verification Input and Verify Button (only shown when OTP is sent) */}
//             {stage === 'otpSent' && (
//               <>
//                 <div className="mb-5 mt-6"> {/* Added mt-6 for spacing below phone number */}
//                   <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
//                   <div className="flex justify-between space-x-2">
//                     {otp.map((digit, index) => (
//                       <input
//                         key={index}
//                         id={`otp-input-${index}`}
//                         type="text"
//                         maxLength="1"
//                         value={digit}
//                         onChange={(e) => handleOtpChange(e, index)}
//                         onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                         autoFocus={index === 0}
//                         className="w-1/6 h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       />
//                     ))}
//                   </div>
//                   {formErrors.otp && <p className="text-red-500 text-xs italic mt-2">{formErrors.otp}</p>}
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out"
//                 >
//                   Verify &amp; Submit
//                 </button>
//               </>
//             )}

//             {serverError && <p className="text-red-500 mt-4 text-sm text-center">{serverError}</p>}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyPhone;


import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/urlUtils';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; // Make sure this is imported!
import logo from '../assets/companylogos/5dvdc_white.svg'; // Assuming this path is correct

const VerifyPhone = () => {
  // Initialize userDetails with default empty strings to prevent null access errors
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    phoneNumber: '',
    countryCode: '',
  });
  const [loadingUserDetails, setLoadingUserDetails] = useState(true); // New loading state for user details
  const [otp, setOtp] = useState(Array(6).fill('')); // For 6 digit OTP
  // Stage management:
  // 'inputPhone': User is entering/editing phone number, OTP section is hidden.
  // 'otpSent': Phone number is disabled, OTP section is visible.
  const [stage, setStage] = useState('inputPhone');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // For client-side validation errors
  const [serverError, setServerError] = useState(''); // For backend errors
  const navigate = useNavigate();
  const backendUrl = getBackendUrl();

  // Function to fetch user details from the backend
  const fetchUserDetails = async () => {
    setLoadingUserDetails(true); // Start loading
    setServerError(''); // Clear any previous server errors
    try {
      const res = await fetch(`${backendUrl}/api/auth/pending-user-details`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch user details');
      }

      const data = await res.json();
      // Update userDetails state with fetched data, ensuring all fields are present
      setUserDetails({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        emailId: data.emailId || '',
        phoneNumber: data.phoneNumber || '',
        countryCode: data.countryCode || '',
      });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setServerError(err.message); // Display error to the user
      // Optionally navigate away or show a specific error screen if user details are critical
    } finally {
      setLoadingUserDetails(false); // End loading
    }
  };

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, []); // Empty dependency array means this runs once on mount

  // Handle changes for disabled fields (though they are disabled, keeps structure consistent)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle phone input changes (from react-phone-input-2)
  const handlePhoneInputChange = (phone, country) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      phoneNumber: phone,
      countryCode: country.dialCode, // Store country code if needed by backend
    }));
    // Clear phone number error when user starts typing
    if (formErrors.phoneNumber) {
      setFormErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  // Handle individual OTP input changes
  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    // Allow only single digit numbers or empty string
    if (/[0-9]/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input if a digit is entered and not the last input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
      // Clear OTP error when user starts typing
      if (formErrors.otp) {
        setFormErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  // Handle backspace to move focus to previous OTP input
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  // Client-side validation for phone number and terms before sending OTP
  const validateSubmitPhoneForm = () => {
    const errors = {};
    // Basic check for phone number format
    if (!userDetails.phoneNumber || userDetails.phoneNumber.length < 5 || !/^\+?[0-9\s-()]+$/.test(userDetails.phoneNumber)) {
        errors.phoneNumber = 'A valid phone number is required.';
    }
    if (!agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }
    setFormErrors(errors); // Set errors to display them
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Client-side validation for OTP before verification
  const validateVerifyOtpForm = () => {
    const errors = {};
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      errors.otp = 'Please enter the complete 6-digit OTP.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPhone = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setServerError(''); // Clear any previous server errors
    setFormErrors({}); // Clear previous form errors

    if (!validateSubmitPhoneForm()) {
      return; // Stop if client-side validation fails
    }

    try {
      const res = await fetch(`${backendUrl}/api/auth/submit-phone`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: userDetails.phoneNumber,
          // You might also send countryCode if your backend expects it
          // countryCode: userDetails.countryCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStage('otpSent'); // Change stage to show OTP and disable phone
      // Optionally, alert user that OTP was sent
      // alert('OTP sent successfully!'); // Replaced alert with a message box if needed
    } catch (err) {
      setServerError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setServerError(''); // Clear any previous server errors
    setFormErrors({}); // Clear previous form errors

    if (!validateVerifyOtpForm()) {
      return; // Stop if client-side validation fails
    }

    try {
      const fullOtp = otp.join(''); // Join the OTP array into a single string

      const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: fullOtp }), // Ensure the key matches backend expectation, typically 'otp'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'OTP verification failed');
      }

      // --- CRITICAL CHANGE START ---
      const data = await res.json(); // Parse the JSON response from the backend
      if (data.success && data.redirectTo) {
        // Perform a full browser redirect using window.location.href
        // This causes a full page reload, allowing useAutodeskAuth to correctly
        // detect the 'authStatus=success' from the URL query parameters.
        window.location.href = data.redirectTo;
      } else {
        // Fallback error if backend didn't provide expected redirect info
        throw new Error(data.message || 'OTP verification success, but no redirect information received.');
      }
      // --- CRITICAL CHANGE END ---

    } catch (err) {
      setServerError(err.message); // Use setServerError for backend errors
    }
  };

  const handleEditPhone = () => {
    setStage('inputPhone'); // Go back to phone input stage
    setOtp(Array(6).fill('')); // Clear OTP field
    setFormErrors({}); // Clear form errors
    setServerError(''); // Clear server errors
  };

  // Show loading indicator while fetching user details
  if (loadingUserDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-xl">Loading user details...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel (60% width on medium screens and up, hidden on small) */}
      <div className="hidden md:flex flex-col items-center p-5 bg-[#0D2C54] text-white w-3/5 shrink-0">
        <div className="mt-12 text-center">
          {/* Replace with your actual logo path */}
          <img src={logo} alt="5DVC Learning Academy Logo" className="w-24 h-auto mx-auto" />
          <p className="mt-2 text-lg font-semibold tracking-wider">LEARNING ACADEMY</p>
        </div>
      </div>

      {/* Right Panel (40% width on medium screens and up, full width on small) */}
      <div className="flex flex-1 items-center justify-center p-5 w-full md:w-2/5">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-lg">
          <h2 className="text-3xl text-gray-800 mb-2 font-semibold">Get Started</h2>
          <p className="text-gray-600 mb-8">Verify and Complete your Details</p>

          <form onSubmit={stage === 'inputPhone' ? handleSubmitPhone : handleVerifyOtp}>
            {/* First Name and Last Name on the same line */}
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={userDetails.firstName}
                  onChange={handleChange}
                  disabled
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="w-1/2">
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={userDetails.lastName}
                  onChange={handleChange}
                  disabled
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email Address:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userDetails.emailId}
                onChange={handleChange}
                disabled
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Phone Number Input and Edit Button */}
            <div className="mb-5">
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number:
              </label>
              <div className="flex items-center space-x-2"> {/* Flex container for phone input and edit button */}
                <div className="flex-grow"> {/* Allows PhoneInput to take available space */}
                  <PhoneInput
                    country={'in'}
                    value={userDetails.phoneNumber}
                    onChange={handlePhoneInputChange}
                    inputProps={{
                      name: 'phoneNumber',
                      required: true,
                      autoFocus: true,
                      id: 'phoneNumber',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '48px',
                      fontSize: '1em',
                      border: formErrors.phoneNumber ? '1px solid red' : '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      paddingLeft: '52px',
                    }}
                    containerStyle={{ width: '100%' }}
                    buttonStyle={{ borderRadius: '0.375rem 0 0 0.375rem', borderRight: '1px solid #d1d5db' }}
                    enableSearch={true}
                    placeholder="Enter phone number"
                    dropdownStyle={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                    disabled={stage === 'otpSent'} // Disable when OTP is sent
                  />
                </div>
                {stage === 'otpSent' && ( // Show edit button only when OTP is sent
                  <button
                    type="button" // Important: type="button" to prevent form submission
                    onClick={handleEditPhone}
                    className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 ease-in-out text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
              {formErrors.phoneNumber && (
                <p className="text-red-500 text-xs italic mt-2">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* Terms and Conditions (always visible) */}
            <div className="mb-5 flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (formErrors.agreedToTerms) {
                    setFormErrors(prev => ({ ...prev, agreedToTerms: '' }));
                  }
                }}
                className="mr-3 leading-tight text-blue-600 focus:ring-blue-500 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-gray-700 text-sm">
                I agree to the{' '}
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </a>{' '}
                &amp;{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {formErrors.agreedToTerms && (
              <p className="text-red-500 text-xs italic -mt-3 mb-5">{formErrors.agreedToTerms}</p>
            )}

            {/* Submit Phone / Send OTP Button (only visible when phone is editable) */}
            {stage === 'inputPhone' && (
              <button
                type="submit"
                disabled={!agreedToTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send OTP
              </button>
            )}

            {/* OTP Verification Input and Verify Button (only shown when OTP is sent) */}
            {stage === 'otpSent' && (
              <>
                <div className="mb-5 mt-6"> {/* Added mt-6 for spacing below phone number */}
                  <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
                  <div className="flex justify-between space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        autoFocus={index === 0}
                        className="w-1/6 h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    ))}
                  </div>
                  {formErrors.otp && <p className="text-red-500 text-xs italic mt-2">{formErrors.otp}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  Verify &amp; Submit
                </button>
              </>
            )}

            {serverError && <p className="text-red-500 mt-4 text-sm text-center">{serverError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
