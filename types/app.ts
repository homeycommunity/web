interface FlowTitle {
  de?: string
  en: string
  it?: string
  nl?: string
  es?: string
  fr?: string
}

interface FlowLabel {
  de?: string
  en: string
  it?: string
  nl?: string
  es?: string
  fr?: string
}

interface FlowValue {
  id: string
  title?: FlowTitle
  label?: FlowLabel
}

interface FlowArg {
  name: string
  type: string
  filter?: string
  values?: FlowValue[]
  max?: number
  min?: number
  step?: number
  placeholder?: {
    de?: string
    en?: string
    it?: string
    nl?: string
  }
}

interface FlowAction {
  id: string
  args: FlowArg[]
  title?: FlowTitle
  titleFormatted?: {
    de?: string
    en: string
    it?: string
    nl?: string
  }
  tokens?: {
    name: string
    type: string
    title: FlowTitle
    example?: string
  }[]
  hint?: {
    de?: string
    en: string
    it?: string
    nl?: string
  }
  filter?: {
    capabilities: string
  }
  deprecated?: boolean
}

interface Flow {
  actions: FlowAction[]
  triggers: FlowAction[]
  conditions: FlowAction[]
}

interface DriverSetting {
  id: string
  type: string
  label: {
    de?: string
    en: string
    it?: string
    nl?: string
  }
  children?: {
    id: string
    type: string
    label: FlowTitle
    value: string | number | boolean
    hint?: {
      en: string
      it?: string
      nl?: string
    }
    pattern?: string
    attr?: {
      max: number
      min: number
    }
    values?: {
      id: string
      label: {
        en: string
      }
    }[]
  }[]
}

interface Driver {
  id: string
  icon: string
  name: {
    en: string
  }
  pair: {
    id: string
    template?: string
    navigation?: {
      next: string
    }
  }[]
  class: string
  energy: {
    batteries?: string[]
    approximation?: {
      usageConstant: number
    }
  }
  images: {
    large: string
    small: string
  }
  settings: DriverSetting[]
  capabilities: string[]
  capabilitiesOptions?: {
    [key: string]: {
      preventTag: boolean
    }
  }
}

interface AppInfo {
  id: string
  api?: {
    [key: string]: {
      path: string
      method: string
      public: boolean
    }
  }
  sdk: number
  bugs?: {
    url: string
  }
  flow: Flow
  name: {
    en: string
  }
  tags: {
    de: string[]
    en: string[]
    it: string[]
    nl: string[]
  }
  author: {
    name: string
    email: string
    website: string
  }
  images: {
    large: string
    small: string
  }
  drivers: Driver[]
  version: string
  category: string
  brandColor: string
  description: {
    en: string
  }
  capabilities: {
    [key: string]: {
      type: string
      title: FlowTitle
      getable: boolean
      setable: boolean
      uiComponent: string | null
      uiQuickAction?: boolean
      desc?: {
        de: string
        en: string
        es: string
        fr: string
        it: string
        nl: string
      }
      icon?: string
    }
  }
  contributing: {
    donate: {
      paypal: {
        username: string
      }
    }
  }
  contributors: {
    developers: {
      name: string
      email: string
    }[]
    translators: {
      name: string
    }[]
  }
  dependencies: {
    [key: string]: string
  }
  compatibility: string
  homeyCommunityTopicId: number
}

export type { AppInfo }
