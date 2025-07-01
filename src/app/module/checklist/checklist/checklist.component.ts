import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MachineService } from '../../../services/machine.service';
import { MachineChecklistService } from '../../../services/machine-checklist.service';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../../core/service/storage.service';
import { NotifyService } from '../../../core/service/notify.service';

interface Choice {
    name: string;
    value: string;
}

interface MachineStatus {
    name: string;
    value: string;
}

interface MachineChecklist {
    id: number;
    machineCode: string;
    question: {
        id: number;
        questionId: string;
        questionDetail: string;
        questionDescription: string;
    } | null;
    answerChoice: string | boolean;
    checkStatus: string;
    resetTime: string;
}

interface ChecklistRequestDTO {
    machineCode: string;
    machineName: string;
    machineStatus: string;
    checklistItems: { id: number; questionDetail: string; answerChoice: string; checkStatus: boolean }[];
    note: string;
    machineImage: string;
    userId: string;
    userName: string;
    supervisor: string;
    manager: string;
    jobDetail: string;
}

@Component({
    selector: 'app-checklist',
    standalone: false,
    templateUrl: './checklist.component.html',
    styleUrls: ['./checklist.component.scss'],
    providers: [MessageService]
})
export class ChecklistComponent implements OnInit {
    machineCode: string | null = null;
    machine: any = null;
    checklist: MachineChecklist[] = [];
    choices: Choice[] = [];
    machineStatus: MachineStatus[] | undefined;
    selectedStatus: MachineStatus | undefined;
    note: string = '';
    files: File[] = [];
    uploadedFiles: string[] = [];
    totalSize: number = 0;
    totalSizePercent: number = 0;
    formSubmitted: boolean = false;
    jobDetail: string = '';

    private uploadUrl = 'http://localhost:8080/api/upload';

    constructor(
        private route: ActivatedRoute,
        private machineService: MachineService,
        private checklistService: MachineChecklistService,
        private checklistRecordsService: ChecklistRecordsService,
        private messageService: MessageService,
        private router: Router,
        private http: HttpClient,
        private storageService: StorageService,
        private notifyService: NotifyService
    ) {}

    ngOnInit() {
        this.machineCode = this.route.snapshot.paramMap.get('machineCode');
        if (this.machineCode) {
            this.loadMachineData(this.machineCode);
        }
        this.choices = [
            { name: 'พร้อมใช้งาน', value: 'พร้อมใช้งาน' },
            { name: 'ไม่พร้อมใช้งาน (รอซ่อม)', value: 'ไม่พร้อมใช้งาน (รอซ่อม)' },
            { name: 'ไม่พร้อมใช้งาน (ซ่อม)', value: 'ไม่พร้อมใช้งาน (ซ่อม)' },
            { name: 'ไม่พร้อมใช้งาน (ปรับเปลี่ยนอุปกรณ์)', value: 'ไม่พร้อมใช้งาน (ปรับเปลี่ยนอุปกรณ์)' },
            { name: 'อื่นๆ', value: 'อื่นๆ' }
        ];
        this.machineStatus = [
            { name: 'ใช้งานได้', value: 'ใช้งานได้' },
            { name: 'ไม่ได้ใช้งาน', value: 'ไม่ได้ใช้งาน' },
            { name: 'ซ่อมบำรุง', value: 'ซ่อมบำรุง' }
        ];
    }

    shouldUseDropdown(item: MachineChecklist): boolean {
        // Show dropdown when answerChoice is true (boolean or string 'true')
        // Show input when answerChoice is false (boolean or string 'false')
        return item.answerChoice === true || item.answerChoice === 'true';
    }

    getSelectValue(item: MachineChecklist): string {
        // For dropdown, return the actual choice value if it's not boolean
        if (item.answerChoice === 'true' || item.answerChoice === true) {
            return ''; // Default empty for new selection
        }
        return typeof item.answerChoice === 'string' && 
               item.answerChoice !== 'false' && 
               item.answerChoice !== 'true' ? item.answerChoice : '';
    }

    getInputValue(item: MachineChecklist): string {
        // For input field, return the text value
        if (item.answerChoice === 'false' || item.answerChoice === false) {
            return ''; // Default empty for new input
        }
        return typeof item.answerChoice === 'string' && 
               item.answerChoice !== 'true' && 
               item.answerChoice !== 'false' ? item.answerChoice : '';
    }

    updateAnswerChoice(item: MachineChecklist, newValue: string) {
        item.answerChoice = newValue;
        this.formSubmitted = false;
        console.log('Updated answerChoice:', item.answerChoice);
    }

    updateInputValue(item: MachineChecklist, newValue: string) {
        item.answerChoice = newValue;
        this.formSubmitted = false;
        console.log('Updated input answerChoice:', item.answerChoice);
    }

    loadMachineData(machineCode: string) {
        this.machineService.getMachineByMachineCode(machineCode).subscribe({
            next: (data) => {
                this.machine = data;
                if (data.responsiblePersonId === this.storageService.getUsername() && data.check_status === 'รอดำเนินการ') {
                    this.loadChecklist(machineCode);
                } else {
                    this.loadChecklistGeneral(machineCode);
                }
            },
            error: (error) => {
                console.error('Error loading machine data:', error);
            }
        });
    }

    loadChecklist(machineCode: string) {
        this.checklistService.getMachineByMachineCode(machineCode).subscribe({
            next: (data) => {
                this.checklist = (data || []).sort((a: any, b: any) => a.id - b.id).map((item: any) => {
                    return {
                        ...item,
                        question: item.question || { id: 0, questionId: '', questionDetail: 'N/A', questionDescription: 'N/A' },
                        answerChoice: item.answerChoice
                    };
                });
            },
            error: (error) => {
                console.error('Error loading checklist:', error);
                this.checklist = [];
            }
        });
    }

    loadChecklistGeneral(machineCode: string) {
        this.checklistService.getChecklistGeneral(machineCode).subscribe({
            next: (data) => {
                this.checklist = (data || []).sort((a: any, b: any) => a.id - b.id).map((item: any) => {
                    return {
                        ...item,
                        question: item.question || { id: 0, questionId: '', questionDetail: 'N/A', questionDescription: 'N/A' },
                        answerChoice: item.answerChoice
                    };
                });
            },
            error: (error) => {
                console.error('Error loading checklist:', error);
                this.checklist = [];
            }
        });
    }

    uploadFiles(event: any) {
        const files: File[] = event.files;
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file, file.name);
        });
        this.http.post(this.uploadUrl, formData).subscribe({
            next: (response: any) => {
                this.uploadedFiles = response.uploadedFiles || [];
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Files uploaded successfully',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Upload error:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'File upload failed',
                    life: 3000
                });
            }
        });
    }

    onSelectedFiles(event: any) {
        this.files = event.currentFiles;
        this.totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        this.totalSizePercent = this.totalSize / 1000000 * 100; // Assuming maxFileSize is 1MB
    }

    onRemoveTemplatingFile(file: File) {
        this.files = this.files.filter(f => f !== file);
        this.uploadedFiles = this.uploadedFiles.filter(url => !url.includes(file.name));
        this.totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
        this.totalSizePercent = this.totalSize / 1000000 * 100;
    }

    onClearTemplatingUpload(clear: () => void) {
        clear();
        this.files = [];
        this.uploadedFiles = [];
        this.totalSize = 0;
        this.totalSizePercent = 0;
    }

    onTemplatedUpload(event: any) {
        console.log('Upload completed:', event);
    }

    onCancel() {
        this.router.navigate(['/dashboard']);
    }

    isFormValid(): boolean {
        if (!this.selectedStatus) {
            return false;
        }
        const incompleteItems = this.checklist.some(item => {
            if (this.shouldUseDropdown(item)) {
                // For dropdown, check if a valid choice is selected
                const selectValue = this.getSelectValue(item);
                return !selectValue || selectValue.trim() === '';
            } else {
                // For input field, check if text is entered
                const inputValue = this.getInputValue(item);
                return !inputValue || inputValue.toString().trim() === '';
            }
        });
        if (this.jobDetail.trim() === '') {
            return false;
        }
        return !incompleteItems;
    }

    saveChecklist(): void {
        this.formSubmitted = true;

        if (!this.selectedStatus) {
            this.notifyService.msgWarn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกสถานะของเครื่องจักร');
            return;
        }

        const incompleteItems = this.checklist.filter(item => {
            if (this.shouldUseDropdown(item)) {
                const selectValue = this.getSelectValue(item);
                return !selectValue || selectValue.trim() === '';
            } else {
                const inputValue = this.getInputValue(item);
                return !inputValue || inputValue.toString().trim() === '';
            }
        });

        if (incompleteItems.length > 0) {
            this.notifyService.msgWarn('ข้อมูลไม่ครบถ้วน', 'กรุณาตอบคำถามทุกข้อในรายการตรวจสอบ');
            return;
        }

        if (!this.jobDetail.trim()) {
            this.notifyService.msgWarn('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกใส่รายละเอียดงาน');
            return;
        }

        this.checklist = this.checklist.map(item => ({
            ...item,
            checkStatus: 'true'
        }));

        const request: ChecklistRequestDTO = {
            machineCode: this.machineCode || '',
            machineName: this.machine?.machineName || '',
            machineStatus: this.selectedStatus.value,
            checklistItems: this.checklist.map(item => ({
                id: item.id,
                questionDetail: item.question?.questionDetail || 'N/A',
                answerChoice: item.answerChoice?.toString() || '',
                checkStatus: item.checkStatus === 'true'
            })),
            note: this.note,
            machineImage: this.files.length > 0 ? this.files[0].name : '',
            userId: this.storageService.getUsername(),
            userName: this.storageService.getFullName().replace("+", " "),
            supervisor: this.machine?.supervisorId || '',
            manager: this.machine?.managerId || '',
            jobDetail: this.jobDetail
        };

        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
        if (this.files.length > 0) {
            formData.append('file', this.files[0]);
        }

        this.checklistRecordsService.saveChecklistRecord(formData).subscribe({
            next: (response) => {
                this.notifyService.msgSuccess('สำเร็จ', 'รายการตรวจสอบถูกบันทึกเรียบร้อยแล้ว');
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                console.error('Error saving checklist:', error);
                this.notifyService.msgError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกรายการตรวจสอบได้ กรุณาติดต่อผู้ดูแลระบบ');
            }
        });
    }

    onFileSelected(event: any): void {
        const files: File[] = event.files || (event.target?.files ? Array.from(event.target.files) : []);
        this.files = files.length > 0 ? [files[0]] : []; // Take only the first file
    }
}
