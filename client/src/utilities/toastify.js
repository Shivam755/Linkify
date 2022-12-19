import { toast } from "react-toastify";

const updateToast = (id, msg, type) => {
  return toast.update(id, {
    type: type,
    render: msg,
    isLoading: false,
    autoClose: 2000,
  });
};

export { updateToast };
