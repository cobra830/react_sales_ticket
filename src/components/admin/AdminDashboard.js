import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Input, Popconfirm, Table } from "antd";
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

  // const [show, setShow] = useState(false);
  // const [editedItem, setEditedItem] = useState(null);
  // const [addNewEvent, setAddNewEvent] = useState(false);

  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  // const handleDeleteEvent = (idToRemove) => {
  //   setEvents((prev) => prev.filter((event) => event.id !== idToRemove));
  // };

  // const handleClickAddEvent = () => {
  //   handleShow();
  //   setEditedItem({
  //     id: new Date().getTime(),
  //     speaker: "",
  //     speechTitle: "",
  //     date: "",
  //     price: "",
  //     description: "",
  //   });
  //   setAddNewEvent(true);
  // };

  // const handleEditEventSave = () => {
  //   setEvents((prev) =>
  //     prev.map((product) => {
  //       if (product.id === editedItem.id) {
  //         return editedItem;
  //       }

  //       return product;
  //     })
  //   );
  //   handleClose();
  // };

  // const handleAddNewEvent = () => {
  //   setEvents((prev) => [...prev, editedItem]);
  //   handleClose();
  // };

  useEffect(() => {
    if (!authToken) {
      navigation(-1);
    }
  }, [authToken, navigation]);

  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(2);
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
          >
            <a>Delete</a>
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
    return;
  };

  const handledeleteAll = () => {
    deleteAll()
      .then(() => {
        getAllProducts()
          .then(() => {
            setDataSource([]);
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

  const getOrderedTickets = () => {
    return;
  };

  const getRemainTickets = () => {
    return;
  };
  useEffect(() => {
    console.log(authToken);
    if (authToken) {
      getAllProducts()
        .then((res) => {
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
  const columns = defaultColumns.map((col) => {
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
      <Button
        onClick={handleAddAll}
        type="primary"
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
        onClick={handleAdd}
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
        onClick={handledeleteAll}
        type="primary"
        style={{
          marginBottom: 16,
          marginLeft: 2,
          marginRight: 2,
          marginTop: 4,
        }}
      >
        Delete All
      </Button>
      <Button
        onClick={getOrderedTickets}
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
        onClick={getRemainTickets}
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
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
}

export default AdminDashboard;
