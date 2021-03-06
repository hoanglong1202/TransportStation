import {
  Box,
  Button,
  Grid,
  IconButton, makeStyles, Paper
} from "@material-ui/core";
import { GridCellParams, GridColDef } from "@material-ui/data-grid";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Alert } from "@material-ui/lab";
import axios from "axios";
import { verify } from "jsonwebtoken";
import Router from "next/router";
import React, { useState } from "react";
import { secret } from "../../../../api/secret";
import Breadcrumbs from "../../../components/Breadcrumbs";
import DataTable from "../../../components/DataTable";
import SearchInput from "../../../components/searchInput";
import Title from "../../../components/Title";
import { UsersMenu } from "../../../database/UsersMenu";


const useStyles = makeStyles((theme) => ({
  grid: {
    marginTop: 20,
    paddingTop: 15,
    paddingLeft: 10,
  },
  gridInputHolder: {
    display: "flex",
    justifyContent: "center",
  },
  inputHolder: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  input: {
    flexGrow: 1,
    marginRight: 10,
  },
  gridButtonHolder: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonHolder: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    padding: 10,
    paddingTop: 5,
  },
  button: {
    maxHeight: 40,
  },
  alert: {
    marginTop: 5,
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));
export default function TuyenXe({ tuyenXe }) {
  const classes = useStyles();
  const [TuyenXeList, setTuyenXeList] = useState(tuyenXe);
  const [refesh, setRefresh] = useState(false);
  const [alertModel, setAlertModel] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  
  const getSelectedValue = (selectedValue) => {
    setSelectedUser(selectedValue);
  };

  const breadcumbData = [
    {
      path: "/admin",
      pathName: "Home",
    },
    {
      pathName: "Quản lý tuyến xe",
    },
  ];

  //tạo data đưa vào data grid
  const approvedTuyenXe = TuyenXeList.filter((x) => x.status === "Đã duyệt");
  const inapprovedTuyenXe = TuyenXeList.filter(
    (x) => x.status === "Chưa duyệt"
  );

  const dataTable = [
    {
      value: "1",
      label: "All",
      data: TuyenXeList,
    },
    {
      value: "2",
      label: "Đã duyệt",
      data: approvedTuyenXe,
    },
    {
      value: "3",
      label: "Chưa duyệt",
      data: inapprovedTuyenXe,
    },
  ];

  const sortModel = [
    {
      field: "id",
      sort: "desc",
    },
  ];

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "diemBatDau", headerName: "Điểm bắt đầu", width: 200 },
    { field: "diemKetThuc", headerName: "Điểm kết thúc", width: 200 },
    { field: "SLChuyen", headerName: "Số chuyến", width: 150 },
    { field: "status", headerName: "Trạng thái", width: 200 },
    {
      field: "Action",
      headerName: " ",
      sortable: false,
      width: 200,
      renderCell: (params: GridCellParams) => (
        <div>
          <Button variant="outlined" color="primary" size="small">
            Action
          </Button>
        </div>
      ),
    },
  ];

  const refreshData = () => {
    setRefresh(!refesh);
    setTuyenXeList(TuyenXe);
    setAlertModel(false);
    console.log("refreshed");
  };

  const searchUsersName = (inputValue) => {
    let searchedData = inputValue
      ? TuyenXeList.filter(
          (x) =>
            x.diemBatDau.toLowerCase().includes(inputValue.toLowerCase()) ||
            x.diemKetThuc.toLowerCase().includes(inputValue.toLowerCase())
        )
      : null;
    searchedData && searchedData.length > 0
      ? (setTuyenXeList(searchedData), setAlertModel(false))
      : (setTuyenXeList(TuyenXe), setAlertModel(true));
  };

  return (
    <Box>
      <Breadcrumbs breadcumbData={breadcumbData} />

      {alertModel ? (
        <div className={classes.alert}>
          <Alert severity="error">
            This is an error alert — <strong>Không tìm thấy Tuyến xe!</strong>
          </Alert>
        </div>
      ) : null}

      <Paper elevation={2} className={classes.grid}>
        <Title>Quản lý Tuyến xe</Title>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5} className={classes.gridInputHolder}>
            <SearchInput searchUsersName={searchUsersName} refesh={refesh} />
          </Grid>

          <Grid item xs={12} sm={7} className={classes.gridButtonHolder}>
            <div className={classes.buttonHolder}>
              <IconButton
                aria-label="refresh"
                className={classes.icon}
                onClick={refreshData}
              >
                <RefreshIcon fontSize="large" />
              </IconButton>
            </div>
          </Grid>
        </Grid>
      </Paper>

      <DataTable
        dataTable={dataTable}
        dataTableColumns={columns}
        sortModel={sortModel}
        getSelectedValue={getSelectedValue}
        title="Tuyến xe"
      />
    </Box>
  );
}
export const getServerSideProps = async (ctx) => {
  const cookie = ctx.req?.headers.cookie;
  //lấy cookie nhưng ở dạng object {auth: abc123}
  const { cookies } = ctx.req;

  var decoded = verify(cookies.auth, secret);

  const tuyenXe = await axios({
    method: "GET",
    url: "http://localhost:3000/api/user/tuyen-xe",
    withCredentials: true,
    headers: {
      Cookie: cookie || null,
      "Content-Type": "application/json",
    },
    data: {
      id: decoded.sub,
    },
  })
    .then((res) => res.data)
    .catch((err) => {
      if (err.response.status === 401 && !ctx.req) {
        Router.replace("/");
        return;
      }

      //server-side
      if (err.response.status === 401 && ctx.req) {
        ctx.res?.writeHead(302, {
          Location: "/",
        });
        ctx.res?.end();
        return;
      }
    });

  return { props: { tuyenXe } };
};
TuyenXe.UsersMenu = UsersMenu;
