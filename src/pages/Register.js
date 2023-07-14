import React, { useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaLink,
  FaLock,
  FaTrashAlt,
  FaUpload,
  FaCloudUploadAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RiCloseCircleLine } from "react-icons/ri";
import { TiPlus } from "react-icons/ti";
import axios from "axios";
import ImageUpload from "../components/ImageUpload";

const Register = () => {
  const navigate = useNavigate();

  const hoursOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    const hour12 = hour % 12 || 12;
    const period = hour < 12 ? "AM" : "PM";
    hoursOptions.push(
      <option key={hour} value={hour}>
        {hour12}:00 {period}
      </option>
    );
  }

  // const ImageUpload = ({ field, form, ...props }) => {
  //   const handleChange = (event) => {
  //     const file = event.currentTarget.files[0];
  //     form.setFieldValue(field.name, file);
  //   };

  //   const hasError = form.touched[field.name] && form.errors[field.name];

  //   return (
  //     <div className="mt-2">
  //       <input
  //         id={field.name}
  //         name={field.name}
  //         type="file"
  //         accept="image/*"
  //         onChange={handleChange}
  //         className="hidden"
  //         {...props}
  //       />
  //       <label htmlFor={field.name}>
  //         <div className="h-40 w-full rounded-md border-dashed border-2 border-gray-300 flex flex-col justify-center items-center">
  //           {form.values[field.name] ? (
  //             <img
  //               src={URL.createObjectURL(form.values[field.name])}
  //               alt="Uploaded profileImg"
  //               className="h-full w-full object-contain"
  //             />
  //           ) : (
  //             <div className="text-center">
  //               <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
  //               <p className="mt-1 text-sm text-gray-600">
  //                 Click or drag a file to upload
  //               </p>
  //             </div>
  //           )}
  //         </div>
  //       </label>
  //       {hasError && (
  //         <div className="mt-2 text-sm text-red-500">
  //           {form.errors[field.name]}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
  const [registered, setRegistered] = useState(true);
  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    shopName: Yup.string().required("Shop Name is required"),
    urlSlug: Yup.string()
      .required("URL Slug is required")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "This field cannot contain white space and special character"
      ),
    workingHours: Yup.array()
      .of(
        Yup.object().shape({
          startHour: Yup.number()
            .required("Start hour is required")
            .test(
              "startHour",
              "Start hour must be less than end hour",
              function (value) {
                return value < this.parent.endHour;
              }
            ),
          endHour: Yup.number()
            .required("End hour is required")
            .test(
              "endHour",
              "End hour must be greater than start hour",
              function (value) {
                return value > this.parent.startHour;
              }
            ),
        })
      )
      .test("noOverlap", "Working hours cannot overlap", function (value) {
        let isValid = true;
        for (let i = 0; i < value.length; i++) {
          for (let j = i + 1; j < value.length; j++) {
            const startHourA = value[i].startHour;
            const endHourA = value[i].endHour;
            const startHourB = value[j].startHour;
            const endHourB = value[j].endHour;

            // Check if there is any overlap between the two periods
            if (
              (startHourA <= startHourB && startHourB < endHourA) ||
              (startHourA < endHourB && endHourB <= endHourA) ||
              (startHourB <= startHourA && startHourA < endHourB) ||
              (startHourB < endHourA && endHourA <= endHourB)
            ) {
              isValid = false;
              break;
            }
          }
          if (!isValid) {
            break;
          }
        }
        return isValid;
      }),
    profileImg: Yup.mixed().required("Profile image is required"),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="h-screen bg-gray-50 py-11 sm:px-6 lg:px-8 overflow-auto">
      <div className="flex flex-col justify-center min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                shopName: "",
                urlSlug: "",
                workingHours: [{ startHour: 0, endHour: 0 }],
                profileImg: "",
              }}
              validationSchema={RegisterSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const formData = new FormData();
                  formData.append("profileImg", values.profileImg);

                  // Upload the image
                  const uploadResponse = await axios.post(
                    "https://agenda-back.onrender.com/managers/profileImg",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );

                  // Get the uploaded image name from the response
                  const profileImg = uploadResponse.data.profileImg;

                  // Update the data with new values (including the image name)
                  const postData = {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    shopName: values.shopName,
                    urlSlug: values.urlSlug,
                    workingHours: values.workingHours,
                    profileImg: profileImg,
                  };

                  console.log(postData);
                  const updateResponse = await axios.post(
                    "https://agenda-back.onrender.com/managers",
                    postData
                  );
                  console.log(updateResponse.data);
                  navigate("/login");
                } catch (error) {
                  console.log(error);
                }

                // setSubmitting(false);
              }}
            >
              {(formikProps) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaUser
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="name"
                        name="name"
                        type="name"
                        autoComplete="name"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.name && formikProps.touched.name
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Name"
                      />
                    </div>
                    {formikProps.errors.name && formikProps.touched.name ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.name}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.email && formikProps.touched.email
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Email address"
                      />
                    </div>
                    {formikProps.errors.email && formikProps.touched.email ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.email}
                      </div>
                    ) : null}
                    {!registered ? (
                      <div className="mt-2 text-sm text-red-500">
                        This email has been registered before
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaLock
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.password &&
                          formikProps.touched.password
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Password"
                      />
                      <div className="absolute inset-y-0 right-5 pr-3 flex items-center text-sm leading-5">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FaEye size={20} />
                          ) : (
                            <FaEyeSlash size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    {formikProps.errors.password &&
                    formikProps.touched.password ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.password}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaLock
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.confirmPassword &&
                          formikProps.touched.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Confirm Password"
                      />
                      <div className="absolute inset-y-0 right-5 pr-3 flex items-center text-sm leading-5">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <FaEye size={20} />
                          ) : (
                            <FaEyeSlash size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    {formikProps.errors.confirmPassword &&
                    formikProps.touched.confirmPassword ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.confirmPassword}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="shopName" className="sr-only">
                      Shop Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaIdCard
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="shopName"
                        name="shopName"
                        type="shopName"
                        autoComplete="shopName"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.shopName &&
                          formikProps.touched.shopName
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Shop Name"
                      />
                    </div>
                    {formikProps.errors.shopName &&
                    formikProps.touched.shopName ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.shopName}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="urlSlug" className="sr-only">
                      URL Slug
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                        <FaLink
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <Field
                        id="urlSlug"
                        name="urlSlug"
                        type="urlSlug"
                        autoComplete="urlSlug"
                        className={`appearance-none rounded-md block w-full px-3 py-2 border ${
                          formikProps.errors.urlSlug &&
                          formikProps.touched.urlSlug
                            ? "border-red-500"
                            : "border-gray-300"
                        } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="URL Sulg"
                      />
                    </div>
                    {formikProps.errors.urlSlug &&
                    formikProps.touched.urlSlug ? (
                      <div className="mt-2 text-sm text-red-500">
                        {formikProps.errors.urlSlug}
                      </div>
                    ) : null}
                  </div>
                  <FieldArray name="workingHours">
                    {({ remove, push }) => (
                      <div>
                        {formikProps.values.workingHours.map(
                          (workingHour, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 my-2"
                            >
                              <div className="w-24">
                                <label
                                  htmlFor={`workingHours[${index}].startHour`}
                                  className="sr-only"
                                >
                                  Start Hour
                                </label>
                                <Field
                                  id={`workingHours[${index}].startHour`}
                                  name={`workingHours[${index}].startHour`}
                                  as="select"
                                  className={`block appearance-none rounded-md w-full px-3 py-2 border ${
                                    formikProps.errors.workingHours?.[index]
                                      ?.startHour &&
                                    formikProps.touched.workingHours?.[index]
                                      ?.startHour
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                >
                                  <option value="">Select start hour</option>
                                  {hoursOptions}
                                </Field>
                                <ErrorMessage
                                  name={`workingHours[${index}].startHour`}
                                  component="div"
                                  className="mt-2 text-sm text-red-500"
                                />
                              </div>
                              <div className="w-24">
                                <label
                                  htmlFor={`workingHours[${index}].endHour`}
                                  className="sr-only"
                                >
                                  End Hour
                                </label>
                                <Field
                                  id={`workingHours[${index}].endHour`}
                                  name={`workingHours[${index}].endHour`}
                                  as="select"
                                  className={`block appearance-none rounded-md w-full px-3 py-2 border ${
                                    formikProps.errors.workingHours?.[index]
                                      ?.endHour &&
                                    formikProps.touched.workingHours?.[index]
                                      ?.endHour
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                >
                                  <option value="">Select end hour</option>
                                  {hoursOptions}
                                </Field>
                                <ErrorMessage
                                  name={`workingHours[${index}].endHour`}
                                  component="div"
                                  className="mt-2 text-sm text-red-500"
                                />
                              </div>
                              {index > 0 && (
                                <div>
                                  <button
                                    type="button"
                                    className="flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800"
                                    onClick={() => remove(index)}
                                  >
                                    <RiCloseCircleLine className="mr-1" />
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        )}
                        <div className="flex justify-end mt-2">
                          {formikProps.values.workingHours.length < 3 && (
                            <button
                              type="button"
                              className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => push({ startHour: 0, endHour: 0 })}
                            >
                              <TiPlus className="mr-1" />
                              Add Working Hour
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </FieldArray>

                  {/* <Field name="profileImg" component={ImageUpload} /> */}
                  <ImageUpload
                    field={{
                      name: `profileImg`,
                      value: formikProps.values.profileImg,
                      onChange: (file) =>
                        formikProps.setFieldValue(`profileImg`, file),
                      onBlur: formikProps.handleBlur,
                    }}
                    form={formikProps}
                  />

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded  text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Register
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
