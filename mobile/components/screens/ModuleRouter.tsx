import type { ModuleId } from "../../constants/modules";
import { DashboardScreen } from "./DashboardScreen";
import { BuildingsScreen } from "./BuildingsScreen";
import { IncidentsScreen } from "./IncidentsScreen";
import { SecurityStaffScreen } from "./SecurityStaffScreen";
import { WorkforceScreen } from "./WorkforceScreen";
import { PatrolsScreen } from "./PatrolsScreen";
import { SOSScreen } from "./SOSScreen";
import { AccessControlScreen } from "./AccessControlScreen";
import { ResidentServicesScreen } from "./ResidentServicesScreen";
import { CRMScreen } from "./CRMScreen";
import { HRScreen } from "./HRScreen";
import { FinanceScreen } from "./FinanceScreen";
import { TrainingScreen } from "./TrainingScreen";
import { CommsScreen } from "./CommsScreen";
import { ReportsScreen } from "./ReportsScreen";
import { getModuleLabel } from "../../constants/modules";
import { Screen } from "../ui/Screen";

export function ModuleRouter({ id }: { id: ModuleId | string }) {
  switch (id) {
    case "dashboard":
      return <DashboardScreen />;
    case "buildings":
      return <BuildingsScreen />;
    case "incidents":
      return <IncidentsScreen />;
    case "security-staff":
      return <SecurityStaffScreen />;
    case "workforce":
      return <WorkforceScreen />;
    case "patrols":
      return <PatrolsScreen />;
    case "sos":
      return <SOSScreen />;
    case "access-control":
      return <AccessControlScreen />;
    case "resident-services":
      return <ResidentServicesScreen />;
    case "crm":
      return <CRMScreen />;
    case "hr":
      return <HRScreen />;
    case "finance":
      return <FinanceScreen />;
    case "training":
      return <TrainingScreen />;
    case "comms":
      return <CommsScreen />;
    case "reports":
      return <ReportsScreen />;
    default:
      return (
        <Screen title={getModuleLabel(id)} subtitle="Module không tồn tại">
          <></>
        </Screen>
      );
  }
}
