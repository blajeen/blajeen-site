/** Original vector illustrations: each product demo has its own visual vocabulary. */
export function DemoArtwork({
  business,
  index = 0,
}: {
  business: "restaurante" | "loja" | "servico";
  index?: number;
}) {
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" focusable="false">
      <ellipse
        cx="124"
        cy="157"
        rx="73"
        ry="12"
        fill="currentColor"
        opacity=".08"
      />
      {business === "restaurante" ? (
        <>
          <ellipse cx="120" cy="103" rx="81" ry="58" fill="#ded6bb" />
          <ellipse cx="120" cy="96" rx="82" ry="56" fill="#fff9e9" />
          <ellipse
            cx="120"
            cy="96"
            rx="64"
            ry="42"
            fill={index === 2 ? "#8d4d31" : "#e8d7a5"}
          />
          {index === 0 ? (
            <>
              <path
                d="M69 96Q43 44 100 67Q140 25 150 71Q196 48 175 104Q195 138 144 125Q98 151 69 96"
                fill="#598258"
              />
              <path
                d="M80 100Q58 64 105 77L122 112Q124 58 150 67L158 112Q175 81 180 89"
                fill="#8ca557"
              />
              {[
                [92, 88],
                [142, 102],
                [119, 121],
                [158, 81],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="12" fill="#c75a35" />
                  <circle cx={x} cy={y} r="7" fill="#e99658" />
                </g>
              ))}
              <path
                d="M100 68l23 5-9 19-23-5zM154 107l19 7-8 19-20-8zM70 110l21 4-4 19-22-7z"
                fill="#eee0a4"
              />
            </>
          ) : index === 1 ? (
            <>
              <path
                d="M69 100Q75 55 126 80T170 98Q154 137 101 103T140 71Q180 80 143 111T85 89Q114 58 161 94T104 125"
                fill="none"
                stroke="#cf9e4b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path d="M110 76q23-25 36-7q-5 23-36 7" fill="#4d7550" />
              <circle cx="82" cy="98" r="8" fill="#b95330" />
              <circle cx="144" cy="121" r="7" fill="#b95330" />
            </>
          ) : (
            <>
              <path d="M79 95l54-43 41 57-64 25z" fill="#ba8055" />
              <path d="M79 95l31 21 64-28v21l-64 25-31-20z" fill="#6d3c2c" />
              <path d="M79 95l54-43 41 36-64 28z" fill="#f2dfb5" />
              <circle cx="135" cy="67" r="12" fill="#aa3b32" />
              <path d="M132 56q14-24 22-10q-4 14-22 10" fill="#568059" />
            </>
          )}
          <path
            d="M28 45v80m-5-80v24m10-24v24M209 45q-12 18 0 45v35"
            fill="none"
            stroke="#939986"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : business === "loja" ? (
        index === 0 ? (
          <>
            <path d="M118 54v94" stroke="#71604a" strokeWidth="8" />
            <ellipse cx="118" cy="149" rx="41" ry="9" fill="#aa9474" />
            <path d="M83 38h69l34 59H50z" fill="#c39358" />
            <ellipse cx="118" cy="97" rx="68" ry="11" fill="#edd9ab" />
            <path d="M86 43h10L73 92H61z" fill="#dfb97c" />
            <path d="M120 34v-9" stroke="#70624d" strokeWidth="6" />
          </>
        ) : index === 1 ? (
          <>
            <path
              d="M95 70Q51 142 90 152h65q36-16-2-82l-2-28H97z"
              fill="#b86e4d"
            />
            <ellipse cx="124" cy="42" rx="27" ry="9" fill="#8e523b" />
            <path
              d="M102 71q-37 71 0 75"
              stroke="#db9672"
              strokeWidth="11"
              fill="none"
            />
            <path
              d="M124 45Q100 0 68 20q6 26 53 20M129 49q10-39 52-28-12 30-51 26"
              fill="#64866c"
            />
          </>
        ) : (
          <>
            <path
              d="M67 100l-7 53m112-51 11 51"
              stroke="#786148"
              strokeWidth="8"
            />
            <rect
              x="57"
              y="44"
              width="128"
              height="76"
              rx="28"
              fill="#abb8a0"
            />
            <rect
              x="57"
              y="96"
              width="128"
              height="42"
              rx="13"
              fill="#83987c"
            />
            <rect x="45" y="79" width="24" height="52" rx="9" fill="#bec9b4" />
            <rect x="173" y="79" width="24" height="52" rx="9" fill="#bec9b4" />
            <path d="M76 62h88" stroke="#dbe1d1" strokeWidth="2" />
          </>
        )
      ) : (
        <>
          <path
            d="M52 142Q36 64 108 50Q172 20 195 90L186 150z"
            fill="currentColor"
            opacity=".08"
          />
          <ellipse cx="110" cy="133" rx="52" ry="17" fill="#a5ad96" />
          <ellipse cx="115" cy="109" rx="42" ry="18" fill="#c6c9b5" />
          <ellipse cx="109" cy="84" rx="32" ry="17" fill="#e4dfc9" />
          <path
            d="M157 134Q147 49 197 34Q215 78 157 97M157 104Q115 72 143 47Q171 72 157 104"
            fill="#6d8e71"
          />
          <path
            d="M159 133q-7-62 38-99"
            stroke="#3e6950"
            strokeWidth="2"
            fill="none"
          />
          {index > 0 ? (
            <>
              <rect
                x="39"
                y="89"
                width="22"
                height="50"
                rx="5"
                fill="#c29c6d"
              />
              <rect
                x="44"
                y="75"
                width="12"
                height="18"
                rx="2"
                fill="#6e7661"
              />
            </>
          ) : null}
        </>
      )}
    </svg>
  );
}
