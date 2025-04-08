export interface Record {
    checklistId: number;
    recheck: boolean;
    machineCode: string;
    machineName: string;
    machineStatus: string;
    machineChecklist: string;
    machineNote: string;
    machineImage: string;
    userId: string;
    userName: string;
    dateCreated: string;
    supervisor: string;
    dateSupervisorChecked: string;
    manager: string;
    dateManagerChecked: string;
    checklistStatus: string;
}