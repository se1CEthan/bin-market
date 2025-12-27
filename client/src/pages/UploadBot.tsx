import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, CheckCircle2, FileUp } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Category } from '@shared/schema';

const botSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.string().min(1, 'Price is required').refine((val) => {
    const n = parseFloat(val);
    return !isNaN(n) && isFinite(n) && n >= 0;
  }, 'Invalid price format'),
  categoryId: z.string().min(1, 'Please select a category'),
  requirements: z.string().optional(),
  supportedOS: z.array(z.string()).min(1, 'Select at least one OS'),
  features: z.string().optional(),
});

type BotFormData = z.infer<typeof botSchema>;

export default function UploadBot() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [botFile, setBotFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<BotFormData>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      categoryId: '',
      requirements: '',
      supportedOS: [],
      features: '',
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('categoryId', data.categoryId);
      if (data.requirements) formData.append('requirements', data.requirements);
      formData.append('supportedOS', JSON.stringify(data.supportedOS));
      
      if (data.features) {
        const featuresArray = data.features.split('\n').filter(f => f.trim());
        formData.append('features', JSON.stringify(featuresArray));
      }

      if (botFile) formData.append('botFile', botFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (demoVideoFile) formData.append('demoVideo', demoVideoFile);
      
      screenshotFiles.forEach((file) => {
        formData.append('screenshots', file);
      });

      const response = await fetch('/api/bots/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Bot Uploaded Successfully',
        description: 'Your bot is pending admin approval.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/developer/bots'] });
      navigate('/developer/dashboard');
    },
    onError: () => {
      toast({
        title: 'Upload Failed',
        description: 'Please check all fields and try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: BotFormData) => {
    if (!botFile) {
      toast({
        title: 'Bot File Required',
        description: 'Please upload the bot file.',
        variant: 'destructive',
      });
      return;
    }
    uploadMutation.mutate(data);
  };

  if (!user?.isDeveloper) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <h2 className="font-display text-2xl font-bold mb-4">Developer Access Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to become a developer to upload bots.
            </p>
            <Button asChild>
              <a href="/developer/signup">Become a Developer</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Upload New Bot</h1>
          <p className="text-muted-foreground">
            Share your automation bot with the community and earn 90% of each sale
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="WhatsApp Auto Responder Bot" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what your bot does, its key features, and how it helps users..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD) *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="29.99"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormDescription>
                          You keep 90% of each sale
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter each feature on a new line&#10;- Auto-reply to messages&#10;- Schedule messages&#10;- Group management"
                          className="min-h-[100px] font-mono text-sm"
                          {...field}
                          data-testid="textarea-features"
                        />
                      </FormControl>
                      <FormDescription>
                        One feature per line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Python 3.8+, Node.js 14+, specific libraries..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-requirements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supportedOS"
                  render={() => (
                    <FormItem>
                      <FormLabel>Supported Operating Systems *</FormLabel>
                      <div className="flex flex-wrap gap-4">
                        {['Windows', 'macOS', 'Linux'].map((os) => (
                          <FormField
                            key={os}
                            control={form.control}
                            name="supportedOS"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(os)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, os])
                                        : field.onChange(field.value?.filter((value) => value !== os));
                                    }}
                                    data-testid={`checkbox-os-${os.toLowerCase()}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{os}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Files & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bot File */}
                <div className="space-y-2">
                  <Label>Bot File * (ZIP or executable)</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover-elevate transition-all">
                    <Input
                      type="file"
                      accept=".zip,.exe,.dmg,.app"
                      onChange={(e) => setBotFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="bot-file"
                      data-testid="input-bot-file"
                    />
                    <Label htmlFor="bot-file" className="cursor-pointer">
                      {botFile ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">{botFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload bot file
                          </p>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover-elevate transition-all">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="thumbnail"
                      data-testid="input-thumbnail"
                    />
                    <Label htmlFor="thumbnail" className="cursor-pointer">
                      {thumbnailFile ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">{thumbnailFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload thumbnail (16:9 recommended)
                          </p>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>

                {/* Demo Video */}
                <div className="space-y-2">
                  <Label>Demo Video (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover-elevate transition-all">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setDemoVideoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="demo-video"
                      data-testid="input-demo-video"
                    />
                    <Label htmlFor="demo-video" className="cursor-pointer">
                      {demoVideoFile ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">{demoVideoFile.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload demo video
                          </p>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/developer/dashboard')}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="flex-1"
                data-testid="button-submit"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Bot'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
