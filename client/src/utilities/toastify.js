import { toast } from "react-toastify";

const updateToast = (id, msg, type, isLoading = false, autoClose = 2000) => {
  return toast.update(id, {
    type: type,
    render: msg,
    isLoading: isLoading,
    autoClose: autoClose,
  });
};

export { updateToast };
