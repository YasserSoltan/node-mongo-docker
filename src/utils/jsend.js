// JSend response helpers
// success: { status: "success", data }
// fail:    { status: "fail", data }
// error:   { status: "error", message, code? }

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: "success",
    data,
  });
}

function fail(res, data, statusCode = 400) {
  return res.status(statusCode).json({
    status: "fail",
    data,
  });
}

function error(res, message, statusCode = 500, code) {
  const body = {
    status: "error",
    message,
  };
  if (code !== undefined) {
    body.code = code;
  }
  return res.status(statusCode).json(body);
}

module.exports = { success, fail, error };


