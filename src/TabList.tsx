import ProfileScreen from "@/app/(usertabs)/profile";
import { Icon, Text } from "@ui-kitten/components";
import BlockTable from "./components/BlockTable";
import ClassificationTable from "./components/ClassificationTable";
import GroupTable from "./components/GroupTable";
import HistoryTable from "./components/HistoryTable";
import ImageTable from "./components/ImageTable";
import PeriodTable from "./components/PeriodTable";
import TemperatureTable from "./components/TemperatureTable";
import { TabScreen_t } from "./utils/types";

const TABS: TabScreen_t[] = [
    { icon: <Icon name="person-outline" fill="#fff" width={24} height={24} />, name: "Cá nhân", component: <ProfileScreen /> },
    { icon: <Icon name="grid-outline" fill="#fff" width={24} height={24} />, name: "Bảng", component: <ImageTable /> },
    { icon: <Icon name="bulb-outline" fill="#fff" width={24} height={24} />, name: "Niên đại", component: <HistoryTable /> },
    { icon: <Icon name="globe-2-outline" fill="#fff" width={24} height={24} />, name: "Bác học", component: <HistoryTable /> },
    { icon: <Icon name="shake-outline" fill="#fff" width={24} height={24} />, name: "Chu kỳ", component: <PeriodTable /> },
    { icon: <Icon name="pantone-outline" fill="#fff" width={24} height={24} />, name: "Nhóm", component: <GroupTable /> },
    { icon: <Icon name="thermometer-outline" fill="#fff" width={24} height={24} />, name: "Nhiệt độ", component: <TemperatureTable /> },
    { icon: <Icon name="cube-outline" fill="#fff" width={24} height={24} />, name: "phân loại", component: <ClassificationTable /> },
    { icon: <Icon name="layers-outline" fill="#fff" width={24} height={24} />, name: "phân lớp", component: <BlockTable /> },
    { icon: <Icon name="headphones-outline" fill="#fff" width={24} height={24} />, name: "podcast", component: <Text>podcast</Text> },
    { icon: <Icon name="file-text-outline" fill="#fff" width={24} height={24} />, name: "chi tiết", component: <Text>podcast</Text> },
];

export default TABS;