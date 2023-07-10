import React, { useContext, useEffect, useState } from "react";
import DateTimeContext from "../context/DateTimeContext";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";

const SubmitPayment = ({
  amount,
  clients,
  setModelState,
  bookingInfo,
  setAmount,
  addCustomerClicked,
}) => {
  const { dateTime } = useContext(DateTimeContext);
  const token = localStorage.getItem("ag_app_shop_token");
  const { shopId } = useContext(SidebarContext);

  const handleSubmitPayment = (values, actions) => {
    console.log(values);
    let data = {
      managerId: shopId,
      customer: bookingInfo.customer,
      professional: bookingInfo.professional,
      service: bookingInfo.service,
      dateTime: new Date(),
      amount: values.amount,
      description: values.description,
    };
    console.log(data);

    if (addCustomerClicked) {
      axios
        .post(
          "http://localhost:4040/customers/",
          {
            name: bookingInfo.name,
            phone: bookingInfo.phone,
            managerId: shopId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("ag_app_shop_token"),
            },
          }
        )
        .then((response) => {
          const { customer } = response.data;
          data.customer = customer._id;
          axios
            .post("http://localhost:4040/payments", data, {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            })
            .then((response) => {
              console.log(response.data);
              const cuurentClient = clients.find(
                (client) => client._id === bookingInfo.customer
              );
              const updatedClientPayments =
                Number(cuurentClient.payments) + Number(values.amount);
              console.log("updatedClientPayments: ", updatedClientPayments);
              console.log("customer id: ", bookingInfo.customer);
              axios
                .patch(
                  `http://localhost:4040/customers/${bookingInfo.customer}`,
                  JSON.stringify({ payments: updatedClientPayments }),
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: localStorage.getItem("ag_app_shop_token"),
                    },
                  }
                )
                .then((response) => {
                  console.log(response.data);
                  axios
                    .post(
                      "http://localhost:4040/appointments",
                      {
                        customer: bookingInfo.customer,
                        professional: bookingInfo.professional,
                        service: bookingInfo.service,
                        duration: bookingInfo.duration,
                        dateTime: new Date(dateTime),
                        managerId: shopId,
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token,
                        },
                      }
                    )
                    .then((response) => {
                      console.log(response.data);
                      alert("Booked Successfully");
                      setModelState(false);
                      setAmount(0);
                    })
                    .catch((error) => {
                      console.error(error.message);
                      // Handle errors
                    });
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.error(error.message);
              // Handle errors
            })
            .finally(() => {
              // Reset the form

              actions.setSubmitting(false);
            });
        });
    } else {
      axios
        .post("http://localhost:4040/payments", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
        .then((response) => {
          console.log(response.data);
          const cuurentClient = clients.find(
            (client) => client._id === bookingInfo.customer
          );
          const updatedClientPayments =
            Number(cuurentClient.payments) + Number(values.amount);
          console.log("updatedClientPayments: ", updatedClientPayments);
          console.log("customer id: ", bookingInfo.customer);
          axios
            .patch(
              `http://localhost:4040/customers/${bookingInfo.customer}`,
              JSON.stringify({ payments: updatedClientPayments }),
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: localStorage.getItem("ag_app_shop_token"),
                },
              }
            )
            .then((response) => {
              console.log(response.data);
              axios
                .post(
                  "http://localhost:4040/appointments",
                  {
                    customer: bookingInfo.customer,
                    professional: bookingInfo.professional,
                    service: bookingInfo.service,
                    duration: bookingInfo.duration,
                    dateTime: new Date(dateTime),
                    managerId: shopId,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                  }
                )
                .then((response) => {
                  console.log(response.data);
                  alert("Booked Successfully");
                  setModelState(false);
                  setAmount(0);
                })
                .catch((error) => {
                  console.error(error.message);
                  // Handle errors
                });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.error(error.message);
        })
        .finally(() => {
          // Reset the form

          actions.setSubmitting(false);
        });
    }
  };

  return (
    <Formik
      initialValues={{ amount: amount, description: "" }}
      onSubmit={handleSubmitPayment}
    >
      {({ values, handleSubmit, isSubmitting }) => (
        <Form className="p-4">
          <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
          <div className="mb-4">
            <label htmlFor="amount" className="block font-bold mb-2">
              Amount
            </label>
            <Field
              type="text"
              id="amount"
              name="amount"
              placeholder="$"
              className="border border-gray-300 rounded-md p-2 w-full"
              disabled
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block font-bold mb-2">
              Date
            </label>
            <Field
              type="text"
              id="date"
              name="date"
              value={new Intl.DateTimeFormat(["ban", "id"]).format(new Date())}
              className="border border-gray-300 rounded-md p-2 w-full"
              disabled
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-bold mb-2">
              Description
            </label>
            <Field
              type="text"
              id="description"
              name="description"
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-md mr-2"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              <TiTickOutline className="inline-block mr-2" />
              Submit Payment
            </button>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-md"
              onClick={() => {
                console.log("Payment registration canceled");
                setModelState(false);
                setAmount(0);
              }}
            >
              <TiTimesOutline className="inline-block mr-2" />
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SubmitPayment;
