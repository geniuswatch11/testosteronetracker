"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { profileApi } from "@/lib/api/profile"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n/language-context"
import DatePicker from "./date-picker"
import type { UserProfile } from "@/lib/api/auth"

export type UserProfileData = {
  weight: number
  height: number
  birthDate: string
}

interface PersonalDataFormProps {
  userProfile: UserProfile | null
}

export default function PersonalDataForm({ userProfile }: PersonalDataFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<UserProfileData>({
    weight: 0,
    height: 0,
    birthDate: "",
  })

  // Calcular la fecha máxima (13 años atrás desde hoy)
  // Esta es la fecha más reciente que se puede seleccionar (alguien que tiene exactamente 13 años)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().split("T")[0]

  // No establecemos fecha mínima, para permitir cualquier edad mayor a 13 años
  // Podríamos establecer una fecha mínima razonable si fuera necesario, por ejemplo 100 años atrás
  const minDate = "1900-01-01" // Fecha mínima razonable

  useEffect(() => {
    if (userProfile) {
      setData({
        weight: userProfile.weight || 0,
        height: userProfile.height || 0,
        birthDate: userProfile.birth_date || "",
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Enviar los datos al servidor
      await profileApi.updatePersonalData({
        weight: data.weight,
        height: data.height,
        birthDate: data.birthDate,
      })

      toast.success(t("settings.dataSaved"))
      router.push("/dashboard")
    } catch (error) {
      toast.error(t("settings.saveError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium mb-1">
            {t("settings.weight")}
          </label>
          <input
            id="weight"
            type="number"
            min="66"
            max="660"
            step="0.1"
            required
            value={data.weight || ""}
            onChange={(e) => setData({ ...data, weight: Number.parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium mb-1">
            {t("settings.height")}
          </label>
          <input
            id="height"
            type="number"
            min="3"
            max="8"
            step="0.1"
            required
            value={data.height || ""}
            onChange={(e) => setData({ ...data, height: Number.parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
          <p className="text-xs text-muted-foreground mt-1">{t("settings.heightFeet")}</p>
        </div>

        <DatePicker
          id="birthDate"
          label={t("settings.birthDate")}
          value={data.birthDate}
          onChange={(value) => setData({ ...data, birthDate: value })}
          min={minDate}
          max={maxDate}
          required
          helperText={t("settings.minAge")}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? t("common.saving") : t("settings.saveData")}
      </button>
    </form>
  )
}
