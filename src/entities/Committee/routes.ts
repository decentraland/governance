import handleAPI from "decentraland-gatsby/dist/entities/Route/handle";
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import { COMMITTEE_ADDRESSES } from "./isCommittee";

export default routes((router) => {
  return router.get('/committee', handleAPI(async () => COMMITTEE_ADDRESSES))
})