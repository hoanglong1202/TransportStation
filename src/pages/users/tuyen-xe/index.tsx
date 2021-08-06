import axios from "axios";
import { verify } from "jsonwebtoken";
import Router from "next/router";
import React from "react";
import { secret } from "../../../../api/secret";
import { UsersMenu } from "../../../database/UsersMenu";

export default function TuyenXe({ tuyenXe }) {
  return <pre>{JSON.stringify(tuyenXe, null, 4)}</pre>;
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
