import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import { FaSpinner, FaTrash } from "react-icons/fa";
import ImageUpload from "../components/ImageUpload";
import ThemeContext from "../context/ThemeContext";
import { RiCloseCircleLine } from "react-icons/ri";
import { TiPlus } from "react-icons/ti";

const Settings = () => {
  const { shopName, setShopName } = useContext(SidebarContext);
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("ag_app_shop_token");
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState({});
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

  useEffect(() => {
    axios
      .get("https://agenda-back.onrender.com/managers/id", {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data);
        setShopData(response.data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSubmit = (values, { resetForm }) => {
    // Code to save the changes made to the settings
    let data = {
      shopName: values.shopName,
      name: values.name,
      discount: {
        type: values.discountType,
        value: values.discountValue,
      },
      workingHours: values.workingHours,
    };
    console.log(JSON.stringify(data));

    axios
      .patch(
        "https://agenda-back.onrender.com/managers",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        setShopName(response.data.shopName);
      })
      .catch((error) => console.log(error));
  };

  const deleteProfileImg = () => {
    axios
      .delete(
        `https://agenda-back.onrender.com/managers/profile/${shopData.profileImg}`,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        // Update shopData with the empty profile image
        setShopData({ ...shopData, profileImg: "" });
      })
      .catch((error) => console.log(error));
  };

  const uploadProfileImg = (values, { resetForm }) => {
    const formData = new FormData();
    formData.append("profileImg", values.profileImg);
    let updatedImg = {
      profileImg: values.profileImg,
    };
    console.log(updatedImg);
    axios
      .post(
        "https://agenda-back.onrender.com/managers/profileImg",
        updatedImg,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        // Update shopData with the new profile image
        axios
          .patch(
            "https://agenda-back.onrender.com/managers/",
            JSON.stringify({ profileImg: response.data.profileImg }),
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          )
          .then((response) => {
            console.log(response.data);
            setShopData({
              ...shopData,
              profileImg: response.data.manager.profileImg,
            });
          });
        // setShopData({ ...shopData, profileImg: response.data.profileImg });
      })
      .catch((error) => console.log(error));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <span className="mt-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-9">
      <h1 className="text-3xl font-bold mb-6">Dashboard Settings</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Formik
            initialValues={{
              shopName: shopData.shopName,
              name: shopData.name,
              discountType: shopData?.discount?.type || "",
              discountValue: shopData?.discount?.value || "",
              workingHours:
                shopData?.workingHours?.length === 0
                  ? [{ startHour: 0, endHour: 0 }]
                  : shopData?.workingHours || [{ startHour: 0, endHour: 0 }],
            }}
            validationSchema={Yup.object().shape({
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
                .test(
                  "noOverlap",
                  "Working hours cannot overlap",
                  function (value) {
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
                  }
                ),
            })}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form className="bg-white rounded-lg shadow-md px-8 py-6 mb-4">
                <div className="mb-6">
                  <label
                    htmlFor="shop-name"
                    className="block text-lg text-gray-800 font-semibold mb-2"
                  >
                    Shop Name:
                  </label>
                  <Field
                    type="text"
                    id="shop-name"
                    name="shopName"
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="manager-name"
                    className="block text-lg text-gray-800 font-semibold mb-2"
                  >
                    Manager Name:
                  </label>
                  <Field
                    type="text"
                    id="manager-name"
                    name="name"
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="discount-type"
                    className="block text-lg text-gray-800 font-semibold mb-2"
                  >
                    Discount Type:
                  </label>
                  <Field
                    as="select"
                    id="discount-type"
                    name="discountType"
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray focus:outline-none focus:border-blue-500 w-full"
                  >
                    <option value="">Select Type</option>
                    <option value="percent">Percentage</option>
                    <option value="num">Numeric</option>
                  </Field>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="discount-value"
                    className="block text-lg text-gray-800 font-semibold mb-2"
                  >
                    Discount Value:
                  </label>
                  <Field
                    type="number"
                    id="discount-value"
                    name="discountValue"
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>
                <label
                  htmlFor="discount-value"
                  className="block text-lg text-gray-800 font-semibold mb-2"
                >
                  Working Hours:
                </label>
                <FieldArray name="workingHours">
                  {({ remove, push }) => (
                    <div className="space-y-4 mb-4">
                      {formikProps.values.workingHours.map(
                        (workingHour, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex items-center space-x-2 w-64">
                              <div>
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
                                  className="mt-1 text-sm text-red-500"
                                />
                              </div>
                              <div>
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
                                  className="mt-1 text-sm text-red-500"
                                />
                              </div>
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
                      <div className="flex justify-start">
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

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                    disabled={formikProps.isSubmitting}
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Profile Image</h2>
          {shopData.profileImg ? (
            <div className="relative">
              <img
                src={`https://agenda-back.onrender.com/uploads/profile/${shopData.profileImg}`}
                alt={shopData.profileImg}
                className="w-full rounded-md max-h-40 object-cover mt-2"
              />
              <button
                type="button"
                onClick={deleteProfileImg}
                className="text-red-600 font-medium mt-2 absolute right-1 top-1"
              >
                <FaTrash />
              </button>
            </div>
          ) : (
            <Formik
              initialValues={{
                profileImg: "",
              }}
              onSubmit={uploadProfileImg}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field name="profileImg" component={ImageUpload} />
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded mt-4 focus:outline-none focus:shadow-outline"
                    disabled={isSubmitting}
                  >
                    Upload
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
