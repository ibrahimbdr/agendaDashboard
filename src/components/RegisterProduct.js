import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import ImageUpload from "./ImageUpload";

const RegisterProduct = ({ setModelState }) => {
  const { shopId } = useContext(SidebarContext);
  const initialValues = {
    name: "",
    speciality: "",
    costBRL: "",
    price: "",
    stock: "",
    productImg: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    speciality: Yup.string().required("Speciality is required"),
    costBRL: Yup.number()
      .required("Cost is required")
      .positive("Cost must be a positive number"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be a positive number"),
    stock: Yup.number()
      .required("Stock is required")
      .integer("Stock must be an integer")
      .min(0, "Stock must be a non-negative number"),
    productImg: Yup.mixed().required("Product Picture is required"),
  });

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem("ag_app_shop_token");
      if (!token) {
        console.error("Token not found");
        return;
      }
      const formData = new FormData();
      formData.append("productImg", values.productImg);

      // Upload the image
      const uploadResponse = await axios.post(
        "https://agenda-back.onrender.com/products/imageUpload",
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Get the uploaded image name from the response
      const { filename } = uploadResponse.data;

      // Update the admin data with new values (including the image name)

      const postData = {
        name: values.name,
        speciality: values.speciality,
        costBRL: values.costBRL,
        price: values.costBRL,
        stock: values.stock,
        managerId: shopId,
        productImg: filename,
      };

      const updateResponse = await axios.post(
        "https://agenda-back.onrender.com/products",
        postData,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log(updateResponse.data);
    } catch (error) {
      console.log(error);
    }

    setSubmitting(false);
    setModelState(false);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Register a Product</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {(formikProps) => (
          <Form className="bg-white rounded px-8 pt-6 pb-8 mb-4 overflow-y-auto min-w-[350px] sm:min-w-[500px] mx-auto">
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
                placeholder="Product Name"
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
                htmlFor="speciality"
                className="block text-sm text-gray-700 font-bold mb-2"
              >
                Speciality
              </label>
              <Field
                type="text"
                id="speciality"
                name="speciality"
                placeholder="Product Speciality"
                className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
              />
              <ErrorMessage
                name="speciality"
                component="p"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="costBRL"
                className="block text-sm text-gray-700 font-bold mb-2"
              >
                Cost (BRL)
              </label>
              <Field
                type="number"
                id="costBRL"
                name="costBRL"
                placeholder="0.00"
                className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
              />
              <ErrorMessage
                name="costBRL"
                component="p"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm text-gray-700 font-bold mb-2"
              >
                Price
              </label>
              <Field
                type="number"
                id="price"
                name="price"
                placeholder="0.00"
                className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
              />
              <ErrorMessage
                name="price"
                component="p"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="stock"
                className="block text-sm text-gray-700 font-bold mb-2"
              >
                Stock
              </label>
              <Field
                type="number"
                id="stock"
                name="stock"
                placeholder="0"
                className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
              />
              <ErrorMessage
                name="stock"
                component="p"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="productImg"
                className="block text-sm text-gray-700 font-bold mb-2"
              >
                Image
              </label>
              <ImageUpload
                field={{
                  name: `productImg`,
                  value: formikProps.values.productImg,
                  onChange: (file) =>
                    formikProps.setFieldValue(`productImg`, file),
                  onBlur: formikProps.handleBlur,
                }}
                form={formikProps}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={formikProps.isSubmitting}
                className="bg-gray-800 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Register Product
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RegisterProduct;
