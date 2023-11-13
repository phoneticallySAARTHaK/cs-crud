import {
  Params,
  SubmitOptions,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useSubmit,
} from "react-router-dom";
import { api } from "../api";
import { DeleteModal } from "../components/DeleteModal/DeleteModal";
import { DetailsModal } from "../components/DetailsModal/DetailsModal";
import { routes } from "./routes";

const httpMethod: Record<ActionType, SubmitOptions["method"]> = {
  add: "POST",
  delete: "DELETE",
  edit: "PUT",
} as const;

export const Component = () => {
  const params = useParams<ActionParam>();
  const action = params.action as ActionType;

  const data = useLoaderData() as api.Order;

  const navigate = useNavigate();
  const location = useLocation();
  const submit = useSubmit();

  function onClose() {
    navigate(`/${routes.home}${location.search}`, { replace: true });
  }

  const submitOptions: SubmitOptions = {
    encType: "application/json",
    action: `/${routes.home}${location.search}`,
    method: httpMethod[action],
  };

  return action === "delete" ? (
    <DeleteModal
      isOpen
      onClose={onClose}
      onSubmit={(data) => submit(data, submitOptions)}
      order={data}
    />
  ) : (
    <DetailsModal
      isOpen
      onSubmit={(data) => submit(data, submitOptions)}
      onClose={onClose}
      order={action === "edit" ? data : undefined}
    />
  );
};

export type ActionParam = "id" | "action";
export type ActionType = "edit" | "add" | "delete";
const Actions = new Set<ActionType>(["add", "delete", "edit"]);

export const loader = async ({
  params,
  request,
}: {
  params: Params<ActionParam>;
  request: Request;
}) => {
  const id = params.id;
  const action = params.action as ActionType | null;

  const url = new URL(request.url);
  const search = url.searchParams.toString();
  const redirectUrl = `/${routes.home}${search ? "?" + search : ""}`;

  if (!action || !Actions.has(action)) return redirect(redirectUrl);

  if (action === "add") return null;

  if (!id) return redirect(redirectUrl);

  const data = await api.fetchOrderByID(id);
  return data ?? redirect(redirectUrl);
};
