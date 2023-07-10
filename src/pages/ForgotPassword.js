import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(false);

  const initialValues = {
    email: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setWaiting(true);
    axios
      .post(`http://localhost:4040/password/forgot-password`, values)
      .then((res) => {
        console.log(res);
        setWaiting(false);
        navigate("/check-email");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {waiting ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="flex flex-col items-center space-x-2 max-w-md mx-auto p-4 bg-white rounded-lg">
            <FaSpinner className="animate-spin text-6xl text-blue-500" />
            <span className="mt-2 text-gray-800">
              Sending reset password link...
            </span>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div>
              <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
                Forgot Password
              </h2>
            </div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="mt-8">
                  <div className="rounded-md shadow-sm">
                    <div>
                      <Field
                        type="email"
                        name="email"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm sm:leading-5"
                        placeholder="Email address"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring-indigo-500 active:bg-blue-700 transition duration-150 ease-in-out"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <FiMail className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition ease-in-out duration-150" />
                      </span>
                      Reset Password
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default ForgotPassword;
