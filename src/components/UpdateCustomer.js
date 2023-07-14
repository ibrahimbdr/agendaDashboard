import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const UpdateCustomer = ({ setModelState, customerId }) => {
  const [customerData, setCustomerData] = useState(null);
  const token = localStorage.getItem("ag_app_shop_token");
  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/customers/${customerId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data);
        setCustomerData(response.data);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, []);

  const { shopId } = useContext(SidebarContext);
  // const initialValues = {
  //   name: customerData.name,
  //   phone: customerData.phone,
  // };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    phone: Yup.string().required("Phone is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log(values);
    const data = {
      name: values.name,
      phone: values.phone,
      managerId: shopId,
    };

    const fetchRequest = async () => {
      try {
        const response = await axios.patch(
          `https://agenda-back.onrender.com/customers/${customerId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("ag_app_shop_token"),
            },
          }
        );
      } catch (e) {
        console.error(e.message);
      }
    };

    fetchRequest();

    setSubmitting(false);
    resetForm();
    setModelState(false);
  };

  return (
    <>
      <h2 className="text-xl text-left font-bold mb-4">Update Customer</h2>
      {customerData ? (
        <Formik
          initialValues={{
            name: customerData.name,
            phone: customerData.phone,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="bg-white text-left rounded px-8 pt-6 pb-8 mb-4 overflow-y-auto min-w-[350px] sm:min-w-[500px] mx-auto">
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm text-gray-700 font-bold mb-2"
                >
                  Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-xs italic"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm text-gray-700 font-bold mb-2"
                >
                  Phone
                </label>
                <Field
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="123-456-7890"
                  className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="text-red-500 text-xs italic"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update
              </button>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col justify-center items-center space-x-2">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="mt-2">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateCustomer;
