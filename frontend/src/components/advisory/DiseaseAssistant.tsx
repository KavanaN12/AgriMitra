import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Info,
  Camera,
  Image as ImageIcon,
  HelpCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useCrops, useDiseaseDiagnose } from '../../hooks/useAgriQuery';
import { DiseaseDiagnosisResponse } from '../../types/api';

const SAMPLE_DISEASE_PREVIEWS: Array<{
  label_en: string;
  label_kn: string;
  crop_id: number;
  part: 'leaf' | 'stem' | 'fruit' | 'root' | 'whole_plant';
  symptoms_en: string;
  symptoms_kn: string;
}> = [
  {
    label_en: 'Sugarcane Red Rot / Orange spots',
    label_kn: 'ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ ರೋಗದ ಲಕ್ಷಣ',
    crop_id: 1,
    part: 'stem',
    symptoms_en: 'Red lesions with white center along the leaf midrib and stem vascular bundles.',
    symptoms_kn: 'ಗರಿಗಳ ಮಧ್ಯದ ನಾಳ ಮತ್ತು ಕಾಂಡದ ಒಳಭಾಗ ಕೆಂಪಾಗಿ ಕೊಳೆತಂತೆ ಕಾಣುತ್ತಿದೆ.'
  },
  {
    label_en: 'Paddy Blast / Diamond spots',
    label_kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ / ಕಂದು ಚುಕ್ಕೆ',
    crop_id: 2,
    part: 'leaf',
    symptoms_en: 'Spindle-shaped spots on leaves with grey center and dark brown margin.',
    symptoms_kn: 'ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಅಂಚಿನೊಂದಿಗೆ ಬೂದು ಬಣ್ಣದ ಕಣ್ಣಿನಾಕಾರದ ಚುಕ್ಕೆಗಳು.'
  },
  {
    label_en: 'Tomato Early Blight / Concentric rings',
    label_kn: 'ಟೊಮ್ಯಾಟೊ ಎಲೆ ಮಚ್ಚೆ ರೋಗ',
    crop_id: 6,
    part: 'leaf',
    symptoms_en: 'Circular dark brown spots with concentric target-board rings on lower foliage.',
    symptoms_kn: 'ಕೆಳಗಿನ ಎಲೆಗಳ ಮೇಲೆ ವೃತ್ತಾಕಾರದ ಕಪ್ಪು ಕಂದು ಬಣ್ಣದ ವಲಯಾಕಾರದ ಮಚ್ಚೆಗಳು.'
  }
];

export function DiseaseAssistant() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: crops = [] } = useCrops();
  const diagnoseMutation = useDiseaseDiagnose();

  const [selectedCropId, setSelectedCropId] = useState<number>(1);
  const [selectedPart, setSelectedPart] = useState<'leaf' | 'stem' | 'fruit' | 'root' | 'whole_plant'>('leaf');
  const [symptoms, setSymptoms] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [diagnosisResult, setDiagnosisResult] = useState<DiseaseDiagnosisResponse | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSample = (sample: typeof SAMPLE_DISEASE_PREVIEWS[0]) => {
    setSelectedCropId(sample.crop_id);
    setSelectedPart(sample.part);
    setSymptoms(isKn ? sample.symptoms_kn : sample.symptoms_en);
    setFileName('sample_field_photo.jpg');
    setImagePreview('/sample_leaf.jpg');
    setDiagnosisResult(null);
  };

  const handleDiagnose = () => {
    if (!symptoms.trim()) return;

    diagnoseMutation.mutate(
      {
        crop_id: selectedCropId,
        plant_part: selectedPart,
        symptoms: symptoms.trim(),
        image_data: imagePreview || undefined
      },
      {
        onSuccess: (data) => {
          setDiagnosisResult(data);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Preview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-agri-500/10 to-emerald-500/10 border border-harvest-300 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-harvest-600 text-white shrink-0 shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-earth-900">
                {t('advisory.disease_title')}
              </h2>
              <Badge variant="warning" className="text-[11px] font-semibold">
                {t('advisory.disease_preview_badge')}
              </Badge>
            </div>
            <p className="text-xs text-earth-700 leading-relaxed mt-1">
              {t('advisory.disease_disclaimer')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-earth-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-earth-900">
                {isKn ? 'ರೋಗ ಲಕ್ಷಣ ವಿವರ ದಾಖಲಿಸಿ' : 'Record Plant Symptoms & Photo'}
              </CardTitle>
              <CardDescription className="text-xs text-earth-600">
                {isKn
                  ? 'ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಕಂಡುಬಂದ ಬಾಧಿತ ಗಿಡದ ಫೋಟೋ ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ನಮೂದಿಸಿ'
                  : 'Capture or upload an image of the affected plant part and describe observable signs.'}
              </CardDescription>
            </CardHeader>

            <div className="p-5 pt-0 space-y-4">
              {/* Quick Sample Selector */}
              <div>
                <span className="text-xs font-semibold text-earth-600 mb-1.5 block">
                  {isKn ? 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮಾದರಿಗಳು (ಕ್ಷಿಪ್ರ ಆಯ್ಕೆ):' : 'Demo Sample Presets (Quick Select):'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_DISEASE_PREVIEWS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadSample(sample)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 transition-colors border border-earth-200 font-medium"
                    >
                      {isKn ? sample.label_kn : sample.label_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Selector */}
              <div>
                <label className="text-xs font-semibold text-earth-700 mb-1 block">
                  {t('advisory.select_crop_label')} *
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-earth-300 bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isKn ? c.name_kn : c.name_en} ({c.scientific_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Plant Part Selector */}
              <div>
                <label className="text-xs font-semibold text-earth-700 mb-1 block">
                  {t('advisory.select_part_label')} *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'leaf' as const, label: t('advisory.part_leaf') },
                    { id: 'stem' as const, label: t('advisory.part_stem') },
                    { id: 'fruit' as const, label: t('advisory.part_fruit') },
                    { id: 'root' as const, label: t('advisory.part_root') },
                    { id: 'whole_plant' as const, label: t('advisory.part_whole') }
                  ].map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPart(part.id)}
                      className={`p-2 text-xs font-medium rounded-xl border transition-all text-center ${
                        selectedPart === part.id
                          ? 'bg-agri-700 text-white border-agri-700 shadow-xs'
                          : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-50'
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="text-xs font-semibold text-earth-700 mb-1 block">
                  {t('advisory.upload_photo_label')}
                </label>
                <div className="relative border-2 border-dashed border-earth-300 hover:border-agri-500 rounded-2xl p-4 text-center bg-earth-50/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-16 w-16 rounded-xl bg-earth-200 flex items-center justify-center overflow-hidden shrink-0 border border-earth-300">
                        {imagePreview === '/sample_leaf.jpg' ? (
                          <ImageIcon className="h-8 w-8 text-agri-700" />
                        ) : (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-earth-900 block truncate">
                          {fileName || 'field_specimen.jpg'}
                        </span>
                        <span className="text-[11px] text-agri-700 flex items-center gap-1 mt-0.5 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          {isKn ? 'ಫೋಟೋ ಆಯ್ಕೆಯಾಗಿದೆ (ಬದಲಾಯಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ)' : 'Photo staged (Click to replace)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <Camera className="h-8 w-8 text-earth-400 group-hover:text-agri-600 transition-colors mb-1" />
                      <span className="text-xs font-medium text-earth-700">
                        {isKn ? 'ಕ್ಯಾಮರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Tap to capture leaf photo or browse'}
                      </span>
                      <span className="text-[11px] text-earth-500 mt-0.5">
                        JPG, PNG up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms Description */}
              <div>
                <label className="text-xs font-semibold text-earth-700 mb-1 block">
                  {t('advisory.describe_symptoms_label')} *
                </label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={
                    isKn
                      ? 'ಉದಾಹರಣೆಗೆ: ಎಲೆಯ ಅಂಚುಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಕಾಂಡದಲ್ಲಿ ಕಂದು ಮಚ್ಚೆಗಳು...'
                      : 'e.g. Yellowing leaf edges, brown spots on shoot, stunted growth...'
                  }
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Action Button */}
              <Button
                type="button"
                onClick={handleDiagnose}
                disabled={!symptoms.trim() || diagnoseMutation.isPending}
                className="w-full bg-agri-700 hover:bg-agri-800 text-white font-semibold py-2.5 rounded-xl shadow-xs"
              >
                {diagnoseMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {isKn ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing Symptoms...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-harvest-300" />
                    {t('advisory.diagnose_btn')}
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Output: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          {diagnosisResult ? (
            <Card className="border-agri-300 bg-gradient-to-b from-agri-50/50 to-white shadow-md animate-fadeIn">
              <CardHeader className="pb-3 border-b border-agri-200/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-agri-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-harvest-600" />
                    {t('advisory.diagnosis_result')}
                  </span>
                  <Badge variant="outline" className="border-agri-400 bg-white text-agri-800 text-[11px] font-bold">
                    {t('advisory.confidence')}: {diagnosisResult.confidence_score}%
                  </Badge>
                </div>
                <CardTitle className="text-lg text-earth-900 mt-2">
                  {isKn
                    ? diagnosisResult.suspected_condition_kn || diagnosisResult.suspected_condition_en
                    : diagnosisResult.suspected_condition_en}
                </CardTitle>
              </CardHeader>

              <div className="p-5 space-y-4">
                {/* Immediate Remedies */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-agri-600" />
                    {t('advisory.immediate_remedies')}
                  </h4>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-agri-200">
                    {(isKn
                      ? diagnosisResult.immediate_remedies_kn || diagnosisResult.immediate_remedies_en
                      : diagnosisResult.immediate_remedies_en
                    ).map((remedy, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-earth-800">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-agri-600 text-[10px] font-bold text-white mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{remedy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preventive Measures */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-earth-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {t('advisory.preventive_measures')}
                  </h4>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-earth-200">
                    {(isKn
                      ? diagnosisResult.preventive_measures_kn || diagnosisResult.preventive_measures_en
                      : diagnosisResult.preventive_measures_en
                    ).map((prev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-earth-700">
                        <span className="text-agri-600 font-bold">•</span>
                        <span className="leading-relaxed">{prev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attribution & Legal Notice */}
                <div className="p-3 rounded-xl bg-earth-100 text-[11px] text-earth-700 space-y-1.5">
                  <div className="flex items-center gap-1 font-semibold text-earth-900">
                    <ShieldCheck className="h-3.5 w-3.5 text-agri-700" />
                    <span>{t('advisory.verified_source')}: {diagnosisResult.scientific_source}</span>
                  </div>
                  <p className="text-[10px] text-earth-600 leading-relaxed italic">
                    {isKn
                      ? diagnosisResult.disclaimer_kn || diagnosisResult.disclaimer_en
                      : diagnosisResult.disclaimer_en}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-8 rounded-2xl border-2 border-dashed border-earth-200 bg-earth-50/50 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-earth-800">
                {isKn ? 'ರೋಗ ನಿರ್ಣಯ ಫಲಿತಾಂಶ ಇಲ್ಲಿ ಗೋಚರಿಸುತ್ತದೆ' : 'Awaiting Symptoms & Photo'}
              </h3>
              <p className="text-xs text-earth-500 max-w-xs mt-1">
                {isKn
                  ? 'ಎಡಭಾಗದಲ್ಲಿ ರೋಗ ಲಕ್ಷಣ ನಮೂದಿಸಿ "ರೋಗ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ" ಬಟನ್ ಒತ್ತಿ.'
                  : 'Select a crop, describe signs, and click "Analyze Crop Symptoms" to view organic management advice.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
