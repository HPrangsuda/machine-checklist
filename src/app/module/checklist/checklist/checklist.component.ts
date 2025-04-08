import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MachineService } from '../../../services/machine.service';
import { MachineChecklistService } from '../../../services/machine-checklist.service';
import { ChecklistRecordsService } from '../../../services/checklist-records.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../../core/service/storage.service';

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
    answerChoice: string;
    checkStatus: string;
    resetTime: string;
}

interface ChecklistRequestDTO {
    machineCode: string;
    machineName: string;
    machineStatus: string;
    checklistItems: { questionDetail: string; answerChoice: string }[];
    note: string;
    machineImage: string;
    userId: string;
    userName: string;
    supervisor: string;
    manager: string;
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

    private uploadUrl = 'http://localhost:8080/api/upload';

    constructor(
        private route: ActivatedRoute,
        private machineService: MachineService,
        private checklistService: MachineChecklistService,
        private checklistRecordsService: ChecklistRecordsService,
        private messageService: MessageService,
        private router: Router,
        private http: HttpClient,
        private storageService: StorageService
    ) {}

    ngOnInit() {
        this.machineCode = this.route.snapshot.paramMap.get('machineCode');
        if (this.machineCode) {
            this.loadMachineData(this.machineCode);
            this.loadChecklist(this.machineCode);
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

    updateAnswerChoice(item: MachineChecklist, newValue: string) {
        item.answerChoice = newValue;
        console.log('Updated answerChoice:', item.answerChoice);
    }

    loadMachineData(machineCode: string) {
        this.machineService.getMachineByMachineCode(machineCode).subscribe({
            next: (data) => {
                this.machine = data;
                console.log('Machine Data:', this.machine);
            },
            error: (error) => {
                console.error('Error loading machine data:', error);
            }
        });
    }

    loadChecklist(machineCode: string) {
        this.checklistService.getMachineByMachineCode(machineCode).subscribe({
            next: (data) => {
                this.checklist = (data || []).sort((a:any, b:any) => a.id - b.id).map((item:any) => {
                    // ถ้า answerChoice ไม่มีหรือไม่ตรงกับ choices ให้เริ่มต้นเป็น ''
                    const validChoice = this.choices.some(choice => choice.value === item.answerChoice);
                    return {
                        ...item,
                        question: item.question || { id: 0, questionId: '', questionDetail: 'N/A', questionDescription: 'N/A' },
                        answerChoice: validChoice ? item.answerChoice : '' // ถ้าไม่ตรง choices ให้ว่าง
                    };
                });
                console.log('Checklist Data:', this.checklist);
            },
            error: (error) => {
                console.error('Error loading checklist:', error);
                this.checklist = [];
            }
        });
    }
    
    shouldUseDropdown(item: MachineChecklist): boolean {
        return !item.answerChoice || this.choices.some(choice => choice.value === item.answerChoice);
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

    saveChecklist(): void {
        if (!this.selectedStatus) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'กรุณาเลือกสถานะเครื่องจักร', life: 3000 });
            return;
        }

        const request: ChecklistRequestDTO = {
            machineCode: this.machineCode || '',
            machineName: this.machine?.machineName || '',
            machineStatus: this.selectedStatus.value,
            checklistItems: this.checklist.map(item => ({
                questionDetail: item.question?.questionDetail || 'N/A',
                answerChoice: item.answerChoice || ''
            })),
            note: this.note,
            machineImage: this.files.length > 0 ? this.files[0].name : '',
            userId: this.storageService.getUsername(), 
            userName: this.storageService.getUserFullname(),
            supervisor: this.machine?.supervisorId || '',
            manager: this.machine?.managerId || ''
        };

        this.checklistRecordsService.saveChecklistRecord(request).subscribe({
            next: (response) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'บันทึกสำเร็จ', life: 3000 });
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                console.error('Error saving checklist:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'เกิดข้อผิดพลาดในการบันทึก', life: 3000 });
            }
        });
    }
}