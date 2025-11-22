export type MenuItem = {
  name: string,
  translated_name: string,
  image_url: string,
  bounding_box: {
    left: number,
    top: number,
    width: number,
    height: number,
  },
  original_price?: number,
  converted_price?: number,
  currency?: string,
}

export type MenuData = {
  menu_items: MenuItem[],
  metadata: {
    original_language: string,
    translated_to: string,
    target_currency: string,
    processed_at: string,
    menu_id: number
    total_tokens_used?: number,
    tool_calls?: string[],
  }
}