export interface MachineChecklist {
  id: number;
  machineCode: string;
  question: Question;
  answerChoice: string;
  checkStatus: string;
  resetTime: string;
}
  
export interface Question {
  id: number;
  questionId: string;
  questionDetail: string;
  questionDescription: string;
}