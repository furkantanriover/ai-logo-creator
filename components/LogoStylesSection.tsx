import { FlashList } from "@shopify/flash-list";
import { memo } from "react";
import { Controller } from "react-hook-form";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { LOGO_STYLES } from "~/constants/generation";
import { LogoStyle, LogoStylesSectionProps } from "~/types/generation";
import cn from "~/utils/cn";

// Logo stil öğesi bileşeni
const StyleItem = memo(
  ({
    style,
    selectedStyle,
    onStyleSelect,
  }: {
    style: (typeof LOGO_STYLES)[0];
    selectedStyle: LogoStyle;
    onStyleSelect: (style: LogoStyle) => void;
  }) => (
    <TouchableOpacity
      className={cn("mr-4 items-center", selectedStyle === style.id ? "opacity-100" : "opacity-80")}
      onPress={() => onStyleSelect(style.id)}>
      <View
        className={cn(
          "h-[100px] w-[100px] overflow-hidden rounded-3xl",
          selectedStyle === style.id ? "border-2 border-white" : "border border-gray-600",
          style.id === "none" ? "bg-[#1E1836]" : "bg-[#2A2542]"
        )}>
        <Image source={style.image} className="h-full w-full" resizeMode="cover" />
      </View>
      <Text
        className={cn(
          "mt-1 text-center text-[13px]",
          selectedStyle === style.id ? "font-[700px] text-white" : "font-[400px] text-gray-400"
        )}>
        {style.label}
      </Text>
    </TouchableOpacity>
  )
);

export default function LogoStylesSection({ control, selectedStyle }: LogoStylesSectionProps) {
  // Item ekrandan çıktığında bile doğru stili göstermek için
  // Her bir öğe için ayrı bir Controller kullanmak yerine,
  // Tek bir Controller kullanıp, render prop'unu düzenleyeceğiz
  return (
    <View className="mb-6">
      <Text className="mb-2 text-[20px] font-[600px] text-white">Logo Styles</Text>
      <Controller
        control={control}
        name="style"
        render={({ field: { onChange } }) => (
          <View style={{ height: 140 }}>
            <FlashList
              data={LOGO_STYLES}
              renderItem={({ item }) => (
                <StyleItem style={item} selectedStyle={selectedStyle} onStyleSelect={onChange} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={100}
              extraData={selectedStyle} // Stil değiştiğinde yeniden render edilmesi için
            />
          </View>
        )}
      />
    </View>
  );
}
