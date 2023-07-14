import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import { RiCloseCircleLine } from "react-icons/ri";
import { TiPlus } from "react-icons/ti";

const RegisterProfessional = ({ setModelState, workingHours }) => {
  const { shopId } = useContext(SidebarContext);
  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    officeHours: Yup.array()
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
    description: Yup.string().required("Required"),
  });

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Register a Professional</h2>
      <Formik
        initialValues={{
          name: "",
          officeHours: [{ startHour: 0, endHour: 0 }],
          description: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          console.log(values);
          const postData = {
            name: values.name,
            officeHours: values.officeHours,
            description: values.description,
            managerId: shopId,
          };

          const fetchRequest = async () => {
            try {
              const response = await axios.post(
                "https://agenda-back.onrender.com/professionals/",
                postData,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("ag_app_shop_token"),
                  },
                }
              );
              console.log(response);
            } catch (e) {
              console.error(e.message);
            }
          };

          fetchRequest();
          setSubmitting(false);
          resetForm();
          setModelState(false);
        }}
      >
        {(formikProps) => {
          const hoursOptions = [];

          workingHours.forEach((period) => {
            let range = [];
            for (let i = period.startHour; i <= period.endHour; i++) {
              const hour = i <= 12 ? i : i - 12;
              const periodLabel = i < 12 ? "AM" : "PM";
              range.push(
                <option key={i} value={i}>
                  {hour}:00 {periodLabel}
                </option>
              );
            }
            hoursOptions.push(range);
          });

          console.log(hoursOptions);

          return (
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
                  placeholder="Enter the name of the professional"
                  className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-xs italic"
                />
              </div>
              <FieldArray name="officeHours">
                {({ remove, push }) => (
                  <div className="space-y-4 mb-4">
                    <label
                      htmlFor="officeHours"
                      className="block text-sm text-gray-700 font-bold mb-2"
                    >
                      Office Hours
                    </label>
                    {formikProps.values.officeHours.map((officeHour, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 w-64">
                          <div>
                            <label
                              htmlFor={`officeHours[${index}].startHour`}
                              className="sr-only"
                            >
                              Start Hour
                            </label>
                            <Field
                              id={`officeHours[${index}].startHour`}
                              name={`officeHours[${index}].startHour`}
                              as="select"
                              className={`block appearance-none rounded-md w-full px-3 py-2 border ${
                                formikProps.errors.officeHours?.[index]
                                  ?.startHour &&
                                formikProps.touched.officeHours?.[index]
                                  ?.startHour
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            >
                              <option value="">Start hour</option>
                              {hoursOptions[index]}
                            </Field>
                            <ErrorMessage
                              name={`officeHours[${index}].startHour`}
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`officeHours[${index}].endHour`}
                              className="sr-only"
                            >
                              End Hour
                            </label>
                            <Field
                              id={`officeHours[${index}].endHour`}
                              name={`officeHours[${index}].endHour`}
                              as="select"
                              className={`block appearance-none rounded-md w-full px-3 py-2 border ${
                                formikProps.errors.officeHours?.[index]
                                  ?.endHour &&
                                formikProps.touched.officeHours?.[index]
                                  ?.endHour
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            >
                              <option value="">End hour</option>
                              {hoursOptions[index]}
                            </Field>
                            <ErrorMessage
                              name={`officeHours[${index}].endHour`}
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
                    ))}
                    <div className="flex justify-start">
                      {formikProps.values.officeHours.length <
                        workingHours.length && (
                        <button
                          type="button"
                          className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => push({ startHour: 0, endHour: 0 })}
                        >
                          <TiPlus className="mr-1" />
                          Add Office Hour
                        </button>
                      )}
                    </div>
                    {/* <ErrorMessage
                      name="officeHours"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    /> */}
                  </div>
                )}
              </FieldArray>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm text-gray-700 font-bold mb-2"
                >
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  placeholder="Enter a description of the professional"
                  className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-xs italic"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={formikProps.isSubmitting}
                >
                  Register
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default RegisterProfessional;
