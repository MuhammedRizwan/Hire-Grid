// components/Applications/ApplicationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IJobApplication } from '@/types';
import { SubmitHandler } from 'react-hook-form';
import { cn } from '@/lib/utils';

const applicationSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    hrEmail: z.string().email('Invalid email address'),
    position: z.string().optional(),
    status: z.enum(['applied', 'follow-up', 'interview', 'rejected', 'offer']),
    emailSent: z.boolean(),
    resumeSent: z.boolean(),
    followUpDate: z.string().optional(),
    remarks: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
    application?: IJobApplication;
    onSubmit: (data: FormData) => void;
    onClose: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
    application,
    onSubmit,
    onClose,
}) => {
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: application
            ? {
                ...application,
                followUpDate: application.followUpDate
                    ? application.followUpDate.toISOString().slice(0, 16)  // Convert Date → string for datetime-local
                    : undefined,
            }
            : {
                status: 'applied' as const,
                emailSent: false,
                resumeSent: false,
            },
    });

    const emailSent = watch('emailSent');
    const resumeSent = watch('resumeSent');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };


    const onFormSubmit: SubmitHandler<ApplicationFormData> = (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        if (resumeFile) {
            formData.append('resume', resumeFile);
        }

        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {application ? 'Edit Application' : 'Add New Application'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Company Name *</label>
                            <Input {...register('companyName')} placeholder="Google" />
                            {errors.companyName && (
                                <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">HR Email *</label>
                            <Input {...register('hrEmail')} type="email" placeholder="hr@company.com" />
                            {errors.hrEmail && (
                                <p className="text-red-500 text-sm mt-1">{errors.hrEmail.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Position</label>
                            <Input {...register('position')} placeholder="Frontend Developer" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <Select {...register('status')} defaultValue={application?.status || 'applied'}>
                                <option value="applied">Applied</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="interview">Interview</option>
                                <option value="rejected">Rejected</option>
                                <option value="offer">Offer</option>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                            <Input {...register('followUpDate')} type="datetime-local" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Resume (PDF)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                                >
                                    {resumeFile ? resumeFile.name : 'Choose file'}
                                </label>
                                <Upload className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-medium">Email Sent</span>
                            <Switch
                                checked={emailSent}
                                onCheckedChange={(checked) => setValue('emailSent', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-medium">Resume Sent</span>
                            <Switch
                                checked={resumeSent}
                                onCheckedChange={(checked) => setValue('resumeSent', checked)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Remarks</label>
                        <Textarea {...register('remarks')} rows={3} placeholder="Any additional notes..." />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {application ? 'Update' : 'Create'} Application
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};