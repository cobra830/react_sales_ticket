import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Table,
  Select,
  Space,
  Modal,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../store/AppContext";
import { ProductTicket } from "./ProductTicket";
import { createTickets, getDaletedIDs, addTicket } from "../../api/product";
import ModalChangeEvent from "./ModalChangeEvent";
import {
  getAllProducts,
  deleteTicket,
  deleteAll,
  getOrderedTickets,
  getRemainTickets,
} from "../../api/products";
const EditableContext = React.createContext(null);
const { Option } = Select;
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

function AdminDashboard() {
  const navigation = useNavigate();
  const { authToken, events, setEvents } = useContext(AppContext);
  console.log(events);

  const [show, setShow] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(2);
  const [delticketlist, setDelTicketList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatedAll, SetCreatedAll] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!authToken) {
      navigation(-1);
    }
  }, [authToken, navigation]);

  const [options, setOptions] = useState([]);

  const showModal = async () => {
    setIsModalOpen(true);
    const initOption = [];
    setOptions(initOption);
    const deleteList = [];
    await getDaletedIDs()
      .then(async (res) => {
        options.length = 0;
        await res.map((item) => {
          options.push({
            label: item.key_id,
            value: item.key_id,
          });
        });
        setOptions([...options]);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const selectProps = {
    mode: "multiple",
    style: {
      width: "100%",
    },
    delticketlist,
    options,
    onChange: (newValue) => {
      setDelTicketList(newValue);
    },
    placeholder: "Select Item...",
    maxTagCount: "responsive",
  };

  const handleOk = () => {
    handleAddDeletedTicket(delticketlist);
    alert(delticketlist);
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleDelete = async (key) => {
    console.log("key------------", key);
    await deleteTicket(key)
      .then((res) => {
        getAllProducts()
          .then((res) => {
            setDataSource(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleAddDeletedTicket = async (ids) => {
    await addTicket(ids)
      .then(() => {
        getAllProducts()
          .then((res) => {
            setDataSource(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const defaultColumns = [
    {
      title: "No",
      dataIndex: "key_id",
    },
    {
      title: "First Name",
      dataIndex: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Profession",
      dataIndex: "profession",
    },
    {
      title: "Company",
      dataIndex: "company",
    },
    {
      title: "Ticket Id",
      dataIndex: "productId",
    },
    {
      title: "Price Id",
      dataIndex: "priceId",
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "Ordered",
      dataIndex: "ordered",
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key_id)}
            icon={
              <QuestionCircleOutlined
                style={{
                  color: "red",
                }}
              />
            }
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const handleAddAll = () => {
    createTickets()
      .then(() => {
        getAllProducts()
          .then((res) => {
            setDataSource(res.data);
            SetCreatedAll(true);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: "32",
      address: `London, Park Lane no. ${count}`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleAdd = () => {
    handleShow();
  };

  const handledeleteAll = () => {
    deleteAll()
      .then(() => {
        getAllProducts()
          .then(() => {
            setDataSource([]);
            SetCreatedAll(false);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    return;
  };

  const handleGetOrderedTickets = async () => {
    await getOrderedTickets()
      .then((res) => {
        setDataSource(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleGetRemainTickets = async () => {
    await getRemainTickets()
      .then((res) => {
        setDataSource(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    return;
  };
  useEffect(() => {
    console.log(authToken);
    if (authToken) {
      getAllProducts()
        .then((res) => {
          if (res.data.length != 0) SetCreatedAll(true);
          setDataSource(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [authToken]);
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col, index) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        key: index,
        handleSave,
      }),
    };
  });
  // return (
  //   <div className="container-fluid text-center mb-5 mt-5">
  //     <div className="d-flex flex-row justify-content-center align-items-center mb-4">
  //       <div
  //         className="d-flex justify-content-center align-items-center"
  //         style={{ width: "85%" }}
  //       >
  //         <h1>Admin Dashboard</h1>
  //         <button
  //           className="d-flex justify-content-center align-items-center btn btn-secondary rounded-circle"
  //           style={{
  //             width: 30,
  //             height: 30,
  //             backgroundColor: "#F5F5F5",
  //             color: "black",
  //             marginRight: "10px",
  //           }}
  //           onClick={handleClickAddEvent}
  //         >
  //           +
  //         </button>
  //       </div>
  //       <div className="d-flex justify-content-center" style={{ width: "15%" }}>
  //         <button className="btn btn-danger" onClick={handleDeleteAll}>
  //           Delete All
  //         </button>
  //       </div>
  //     </div>
  //     <div
  //       className="flex-column d-flex justify-content-center"
  //       style={{ paddingLeft: "10%" }}
  //     >
  //       {events.map((ticket) => (
  //         <div key={ticket.id} className="col-md-4 mb-4">
  //           <ProductTicket
  //             {...ticket}
  //             setEditedItem={setEditedItem}
  //             setShow={setShow}
  //             setAddNewEvent={setAddNewEvent}
  //             handleDeleteEvent={handleDeleteEvent}
  //           />
  //         </div>
  //       ))}
  //       {show && (
  //         <ModalChangeEvent
  //           handleClose={handleClose}
  //           handleSave={addNewEvent ? handleAddNewEvent : handleEditEventSave}
  //           setEditedItem={setEditedItem}
  //           editedItem={editedItem}
  //           addNewEvent={addNewEvent}
  //         />
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Button
            onClick={handleAddAll}
            type="primary"
            disabled={isCreatedAll}
            style={{
              marginBottom: 16,
              marginLeft: 4,
              marginRight: 2,
              marginTop: 4,
            }}
          >
            Create All Ticket
          </Button>
          <Button
            onClick={showModal}
            type="primary"
            style={{
              marginBottom: 16,
              marginLeft: 2,
              marginRight: 2,
              marginTop: 4,
            }}
          >
            Add tickets
          </Button>
          <Button
            onClick={handleGetOrderedTickets}
            type="primary"
            style={{
              marginBottom: 16,
              marginLeft: 2,
              marginRight: 2,
              marginTop: 4,
            }}
          >
            Ordered Tickets
          </Button>
          <Button
            onClick={handleGetRemainTickets}
            type="primary"
            style={{
              marginBottom: 16,
              marginLeft: 2,
              marginRight: 2,
              marginTop: 4,
            }}
          >
            Remaining Tickets
          </Button>
        </div>
        <div>
          <Button
            onClick={handledeleteAll}
            disabled={!isCreatedAll}
            type="primary"
            danger
            style={{
              marginBottom: 16,
              marginLeft: 2,
              marginRight: 24,
              marginTop: 4,
            }}
          >
            Delete All
          </Button>
        </div>
      </div>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
          }}
        >
          <Select {...selectProps}>
            {/* {delticketlist &&
              delticketlist.map((item, index) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))} */}
          </Select>
        </Space>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
