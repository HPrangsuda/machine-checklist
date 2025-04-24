// src/app/models/machine.ts
export interface Machine {
  id: number;
  machineCode: string;
  machineName: string;
  machineModel: string;
  machineNumber: string;
  image: string;
  frequency: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  supervisorId: string;
  supervisorName: string;
  managerId: string;
  managerName: string;
  machineStatus: string;
  machineTypeName: string;
  checkStatus: string;
  qrCode: string; 
}

export interface MachineResponse {
  machine: Machine;
  qrCodeImage: string; 
}