import React, { useContext, useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import DateTimeContext from "../context/DateTimeContext";
import axios from "axios";
import SidebarContext from "../context/SidebarContext";
import {
  FaArrowDown,
  FaCheck,
  FaCreditCard,
  FaPlus,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";
import ProfessionalIdContext from "../context/ProfessionalIdContext";
import Select from "react-select";
import Switch from "react-switch";
import { Link, useNavigate } from "react-router-dom";
import Alert from "./Alert";
import { FiArrowDown, FiCheckCircle, FiSearch } from "react-icons/fi";
import { HiArrowDown, HiCheck, HiSearch, HiX } from "react-icons/hi";
import { BiChevronDown } from "react-icons/bi";

const UpdateAppointment = ({
  amount,
  bookingInfo,
  setBookingInfo,
  setAmount,
  setModelState,
  setBooked,
  setAlertMsg,
  setAlertMsgType,
  appointmentId,
}) => {
  const navigate = useNavigate(this);
  const { shopId } = useContext(SidebarContext);
  const [dateTime, setDateTime] = useState(new Date());
  const token = localStorage.getItem("ag_app_shop_token");
  const [duration, setDuration] = useState(0);
  const { professionalId } = useContext(ProfessionalIdContext);
  const [loading, setLoading] = React.useState(true);
  const [clients, setClients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [addCustomerClicked, setAddCustomerClicked] = useState(false);
  const [allowManualDuration, setAllowManualDuration] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `https://agenda-back.onrender.com/customers/shop?shopId=${shopId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setClients(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `https://agenda-back.onrender.com/services/shop?shopId=${shopId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setServices(response.data.services);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://agenda-back.onrender.com/products/shop?shopId=${shopId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setProducts(response.data.products);
        console.log("products", response.data.product);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchAppointment = async () => {
      try {
        const response = await axios.get(
          `https://agenda-back.onrender.com/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setAppointmentData(response.data.appointment);
        // console.log(response.data.appointment);
      } catch (error) {
        console.error(error);
      }
    };

    Promise.all([
      fetchClients(),
      fetchServices(),
      fetchProducts(),
      fetchAppointment(),
    ])
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [shopId, appointmentId]);

  // Rest of your component code

  const validationSchema = Yup.object().shape({
    // customer: Yup.string().required("Customer is required"),
    professional: Yup.string().required("Professional is required"),
    service: Yup.array()
      .test(
        "at-least-one",
        "At least one service selection is required",
        function (value) {
          return value && value.length > 0;
        }
      )
      .of(Yup.string().required("A service name is required")),
    // dateTime: Yup.string().required("Start time is required"),
  });

  useEffect(() => {
    axios
      .get(
        `https://agenda-back.onrender.com/professionals/shop?shopId=${shopId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((response) => {
        setProfessionals(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const timeOptions = [];
  for (let i = 15; i <= 360; i += 15) {
    const timeInMinutes = i;
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    const timeLabel = `${
      hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : ""
    } ${minutes} min`;
    timeOptions.push({ value: timeInMinutes, label: timeLabel });
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    values.dateTime = dateTime;
    let totalPrice = 0;
    let totalDuration = 0;

    services.forEach((serv) => {
      values.service.forEach((s) => {
        if (s === serv._id) {
          totalDuration += serv.duration;
          totalPrice += serv.price;
        }
      });
    });

    products.forEach((prod) => {
      values.product.forEach((p) => {
        if (p === prod._id) {
          totalPrice += p.price;
        }
      });
    });

    if (allowManualDuration) {
      const [hours, minutes] = values.appointmentDuration.split(":");
      totalDuration = parseInt(hours) * 60 + parseInt(minutes);
    }

    const updateAppointment = (customer) => {
      const dateParts = values.date.split("-");
      const timeParts = values.time.split(":");

      var year = parseInt(dateParts[0]);
      var month = parseInt(dateParts[1]) - 1;
      var day = parseInt(dateParts[2]);
      var hour = parseInt(timeParts[0]);
      var minute = parseInt(timeParts[1]);

      const dateObject = new Date(year, month, day, hour, minute);

      let patchData = {
        customer: customer,
        professional: values.professional,
        service: values.service,
        product: values.product,
        duration: totalDuration,
        dateTime: dateObject,
        managerId: shopId,
        status: "updating",
      };

      axios
        .patch(
          `https://agenda-back.onrender.com/appointments/${appointmentId}`,
          patchData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        )
        .then((response) => {
          // console.log(response.data);
          setSubmitting(false);
          resetForm();
          setModelState(false);
          setAlertMsg(
            "Appointment has been rescheduled, go to checkout to process payment"
          );
          setAlertMsgType("success");
          setBooked(true);
        })
        .catch((error) => {
          console.error(error.message);
          // Handle errors
        });
    };

    const registerCustomerWithAppointment = () => {
      axios
        .post(
          "https://agenda-back.onrender.com/customers/",
          {
            name: values.name,
            phone: values.phone,
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
          const { customer } = response.data;
          updateAppointment(customer);
        })
        .catch((error) => {
          console.error(error.message);
        });
    };

    if (addCustomerClicked) {
      registerCustomerWithAppointment();
    } else {
      updateAppointment(values.customer);
    }
  };

  const handleCheckout = (values) => {
    values.dateTime = dateTime;
    let totalPrice = 0;
    let totalDuration = 0;

    services.forEach((serv) => {
      values.service.forEach((s) => {
        if (s === serv._id) {
          totalDuration += serv.duration;
          totalPrice += serv.price;
        }
      });
    });

    products.forEach((prod) => {
      values.product.forEach((p) => {
        if (p === prod._id) {
          totalPrice += p.price;
        }
      });
    });

    if (allowManualDuration) {
      const [hours, minutes] = values.appointmentDuration.split(":");
      totalDuration = parseInt(hours) * 60 + parseInt(minutes);
    }

    const updateAppointment = (customer) => {
      const dateParts = values.date.split("-");
      const timeParts = values.time.split(":");

      var year = parseInt(dateParts[0]);
      var month = parseInt(dateParts[1]) - 1;
      var day = parseInt(dateParts[2]);
      var hour = parseInt(timeParts[0]);
      var minute = parseInt(timeParts[1]);

      const dateObject = new Date(year, month, day, hour, minute);

      let patchData = {
        customer: customer,
        professional: values.professional,
        service: values.service,
        product: values.product,
        duration: totalDuration,
        dateTime: dateObject,
        managerId: shopId,
        status: "updating",
      };

      axios
        .patch(
          `https://agenda-back.onrender.com/appointments/${appointmentId}`,
          patchData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        )
        .then((response) => {
          // console.log(response.data);
          setModelState(false);

          localStorage.setItem(
            "ag_app_booking_info",
            JSON.stringify({
              customer: patchData.customer,
              professional: patchData.professional,
              service: patchData.service,
              product: patchData.product,
              duration: patchData.duration,
              dateTime: patchData.dateTime,
              amount: totalPrice,
              appointmentId: appointmentId,
              managerId: shopId,
              checkoutType: "updating",
            })
          );
          navigate("/checkout");
        })
        .catch((error) => {
          console.error(error.message);
          // Handle errors
        });
    };

    const registerCustomerWithAppointment = () => {
      axios
        .post(
          "https://agenda-back.onrender.com/customers/",
          {
            name: values.name,
            phone: values.phone,
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
          const { customer } = response.data;
          updateAppointment(customer);
        })
        .catch((error) => {
          console.error(error.message);
        });
    };

    if (addCustomerClicked) {
      registerCustomerWithAppointment();
    } else {
      updateAppointment(values.customer);
    }
  };

  return (
    <>
      {appointmentData ? (
        <Formik
          initialValues={{
            customer: appointmentData?.customer?._id || "",
            name: "",
            phone: "",
            professional: appointmentData?.professional?._id || "",
            service: appointmentData?.service.map((s) => s?._id) || [],
            product: appointmentData?.product.map((p) => p?._id) || [],
            dateTime: new Date(appointmentData?.dateTime) || "",
            date: new Date(appointmentData?.dateTime)
              .toISOString()
              .split("T")[0], // Set initial date value
            time: new Date(appointmentData?.dateTime)
              .toTimeString()
              .slice(0, 5), // Set initial time value
            // callTime: "",
            appointmentDuration:
              `${Math.floor(appointmentData?.duration / 60)
                .toString()
                .padStart(2, "0")}:${(appointmentData?.duration % 60)
                .toString()
                .padStart(2, "0")}` || "00:00",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            isSubmitting,
            values,
            getFieldProps,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => {
            function calculateTotalDuration(valueService, services) {
              let totalDuration = 0;

              // Iterate over each service ID in `value.service`
              valueService.forEach((serviceId) => {
                // Find the service in `services` array with matching ID
                const service = services.find(
                  (service) => service._id === serviceId
                );

                // If the service is found, add its duration to the total duration
                if (service) {
                  totalDuration += service.duration;
                }
              });

              return totalDuration;
            }

            const handleDurationChange = (e) => {
              const { name, value } = e.target;
              let hours = parseInt(values.appointmentDuration.split(":")[0]);
              let minutes = parseInt(values.appointmentDuration.split(":")[1]);

              if (name === "hours") {
                hours = parseInt(value) || 0;
              } else if (name === "minutes") {
                minutes = parseInt(value) || 0;
              }

              hours = Math.max(0, Math.min(hours, 23));
              minutes = Math.max(0, Math.min(minutes, 55));

              const updatedDuration = `${hours
                .toString()
                .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

              handleChange({
                target: {
                  name: "appointmentDuration",
                  value: updatedDuration,
                },
              });
            };

            function handleServicesChange(selectedOptions) {
              handleChange({
                target: {
                  name: "service",
                  value: selectedOptions
                    ? selectedOptions.map((option) => option.value)
                    : [],
                },
              });
            }

            return (
              <Form className="bg-white rounded-lg px-8 py-6 mb-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex flex-col mb-4">
                      <div>
                        {!addCustomerClicked ? (
                          <CustomSelect
                            label="Client"
                            id="customer"
                            name="customer"
                            options={clients}
                          />
                        ) : (
                          <>
                            <label
                              htmlFor="name"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              New Client
                            </label>
                            <div className="mb-4">
                              <label
                                htmlFor="name"
                                className="block text-xs font-semibold text-gray-700 mb-2"
                              >
                                Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                className="input-field w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                {...getFieldProps("name")}
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
                                className="block text-xs font-semibold text-gray-700 mb-2"
                              >
                                Phone
                              </label>
                              <input
                                type="text"
                                id="phone"
                                name="phone"
                                className="input-field w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                {...getFieldProps("phone")}
                              />
                              <ErrorMessage
                                name="phone"
                                component="p"
                                className="text-red-500 text-xs italic"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          className="add-customer-button w-full flex items-center bg-gray-800 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          onClick={() =>
                            setAddCustomerClicked(!addCustomerClicked)
                          }
                        >
                          {!addCustomerClicked ? (
                            <>
                              <FaPlus className="mr-2" />
                              Add Customer
                            </>
                          ) : (
                            "Select Customer"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Field
                        name="service"
                        label="Service"
                        component={CustomSelectList}
                        options={services}
                      />
                    </div>

                    <div className="mb-4">
                      <Field
                        name="product"
                        label="Product"
                        component={CustomSelectList}
                        options={products}
                      />
                    </div>
                  </div>

                  <div>
                    <CustomSelect
                      label="Professional"
                      id="professional"
                      name="professional"
                      options={professionals}
                    />
                    <div className="flex justify-start items-center">
                      <label
                        htmlFor="manualDuration"
                        className={`block text-sm font-semibold text-gray-700 mb-2`}
                      >
                        Set Duration Manually
                      </label>
                      <Switch
                        id="manualDuration"
                        name="manualDuration"
                        checked={allowManualDuration}
                        onChange={() =>
                          setAllowManualDuration(!allowManualDuration)
                        }
                        onColor="#86d3ff"
                        onHandleColor="#2693e6"
                        handleDiameter={20}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        height={14}
                        width={30}
                        className="ml-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="appointmentDuration"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Appointment Duration
                      </label>
                      <div className="flex flex-wrap sm:flex-nowrap items-center rounded-lg border border-gray-300 overflow-hidden">
                        <div className="flex items-center w-full">
                          <input
                            type="number"
                            id="hours"
                            name="hours"
                            value={values.appointmentDuration.split(":")[0]}
                            className="input-field w-1/2 sm:w-14 py-2 px-2 text-center text-gray-700 focus:outline-none"
                            onChange={handleDurationChange}
                            disabled={!allowManualDuration}
                          />
                          <span className="text-gray-600 px-2">:</span>
                          <input
                            type="number"
                            id="minutes"
                            name="minutes"
                            value={values.appointmentDuration.split(":")[1]}
                            className="input-field w-1/2 sm:w-14 py-2 px-2 text-center text-gray-700 focus:outline-none"
                            onChange={handleDurationChange}
                            step="5"
                            disabled={!allowManualDuration}
                          />
                        </div>
                        <div className="bg-gray-200 text-gray-600 px-3 py-2 w-1/2 sm:w-fit">
                          <span className="text-xs">HOURS</span>
                        </div>
                        <div className="bg-gray-200 text-gray-600 px-3 py-2 w-1/2 sm:w-fit">
                          <span className="text-xs">MINUTES</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={values.date}
                        className="input-field"
                        {...getFieldProps("date")}
                      />
                      <ErrorMessage
                        name="date"
                        component="p"
                        className="text-red-500 text-xs italic"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="time"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={values.time}
                        className="input-field"
                        {...getFieldProps("time")}
                      />
                      <ErrorMessage
                        name="time"
                        component="p"
                        className="text-red-500 text-xs italic"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {/* <button
                type="submit"
                disabled={isSubmitting}
                className="checkout-button flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Proceed to Checkout
              </button> */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-button flex items-center bg-gray-800 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaRedo className="mr-2" />
                    )}
                    Update
                  </button>
                  <button
                    type="button"
                    // disabled={isSubmitting}
                    onClick={() => handleCheckout(values)}
                    className="checkout-button w-fit ml-1 flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaCreditCard className="mr-2" />
                    )}
                    Checkout
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      ) : (
        <div className="bg-white rounded-lg px-8 py-6 mb-4  w-[500px] sm:w-[700px] mx-auto overflow-y-auto">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="flex flex-col mb-4">
                <div>
                  <div
                    className="bg-gray-300 rounded-md animate-pulse"
                    style={{ height: "66px" }}
                  ></div>
                </div>
                <div>
                  <div className="bg-gray-300 h-9 rounded-md animate-pulse my-1"></div>
                </div>
              </div>

              <div className="mb-4">
                <div
                  className="bg-gray-300 rounded-md animate-pulse"
                  style={{ height: "66px" }}
                ></div>
              </div>
            </div>

            <div>
              <div
                className="bg-gray-300 rounded-md animate-pulse"
                style={{ height: "66px" }}
              ></div>
              <div className="flex justify-start items-center">
                <div className="bg-gray-300 h-7 rounded-md animate-pulse"></div>
              </div>
              <div className="mb-4">
                <div
                  className="bg-gray-300 rounded-md animate-pulse"
                  style={{ height: "70px" }}
                ></div>
              </div>

              <div className="mb-4">
                <div
                  className="bg-gray-300 rounded-md animate-pulse"
                  style={{ height: "54px" }}
                ></div>
              </div>
              <div className="mb-4">
                <div
                  className="bg-gray-300 h- rounded-md animate-pulse"
                  style={{ height: "54px" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateAppointment;

const CustomSelect = ({ label, options, ...props }) => {
  const [field, meta, helpers] = useField(props);

  const handleChange = (selectedOption) => {
    helpers.setValue(selectedOption ? selectedOption.value : "");
  };

  const formattedOptions = options.map((option) => ({
    value: option._id,
    label: option.name,
  }));

  return (
    <div className="mb-4">
      <label
        htmlFor={props.id || props.name}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <Select
        id={props.id || props.name}
        name={props.name}
        className="input-field"
        options={formattedOptions}
        value={formattedOptions.find((option) => option.value === field.value)}
        onChange={handleChange}
        placeholder={`Select ${label}`}
        isClearable
        {...props}
      />
      <ErrorMessage
        name={field.name}
        component="p"
        className="text-red-500 text-xs italic"
      />
    </div>
  );
};

const CustomSelectList = ({ options, label, field, form }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOptions, setSelectedOptions] = useState(field.value || []);

  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleOption = (optionId) => {
    setSelectedOptions([...selectedOptions, optionId]);
    console.log(selectedOptions);
  };

  const removeOption = (optionId, index) => {
    setSelectedOptions(selectedOptions.filter((_, i) => i !== index));
    console.log(selectedOptions);
  };

  const handleBlur = () => {
    setIsOpen(false);
    form.setFieldValue(field.name, selectedOptions);
    form.setFieldTouched(field.name, true);
  };

  return (
    <>
      <label
        htmlFor={field.name}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <div
        className="relative border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-800 pr-2 "
        ref={selectRef}
      >
        <BiChevronDown
          className="absolute text-3xl top-1 right-2 border-l  border-gray-300 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />

        <div className="max-w-[280px] px-1 flex items-center">
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap">
              {selectedOptions.map((optionId, index) => {
                const selectedOption = options.find(
                  (option) => option._id === optionId
                );

                return (
                  <span
                    key={index}
                    className="flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 mx-1 my-1 rounded"
                  >
                    <span className="mr-1">{selectedOption.name}</span>
                    <HiX
                      className="cursor-pointer"
                      onClick={() => removeOption(optionId, index)}
                    />
                  </span>
                );
              })}
            </div>
          )}
          <input
            type="text"
            className="flex-grow p-1 m-1 focus:outline-none"
            style={{ minWidth: "0" }}
            placeholder={selectedOptions.length === 0 ? `Select ${label}` : ""}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsOpen(!isOpen)}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded w-full shadow-lg">
            {options
              .filter((option) =>
                option.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleOption(option._id)}
                >
                  <span>{option.name}</span>
                  {selectedOptions.includes(option._id) && (
                    <HiCheck className="text-gray-500" />
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
