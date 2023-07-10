import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";

const RegisterCustomer = ({ setModelState }) => {
  const { shopId } = useContext(SidebarContext);
  const initialValues = {
    name: "",
    phone: "",
  };

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
        const response = await axios.post(
          "http://localhost:4040/customers/",
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
      <h2 className="text-xl font-bold mb-4">Register a Customer</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white rounded px-8 pt-6 pb-8 mb-4 min-w-[350px] sm:min-w-[500px] mx-auto">
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
              Register
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RegisterCustomer;
