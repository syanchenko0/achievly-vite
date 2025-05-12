import backgroundImage from "@/app/assets/icons/form.png";
import { GoogleIcon } from "@/app/assets/icons/google";
import { VKIcon } from "@/app/assets/icons/vk";
import { YandexIcon } from "@/app/assets/icons/yandex";
import { Button } from "@/shared/ui/button";

function AuthPage() {
  const onSocialLogin = (subject: string) => {
    window.location.href = `${import.meta.env.VITE_BASE_API_URL}/auth/${subject}`;
  };

  return (
    <div className="size-full">
      <div className="size-full max-h-screen max-w-[100vw] overflow-hidden lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Вход</h1>
              <p className="text-balance text-muted-foreground">
                Выберите сервис, с помощью которого вы хотите войти
              </p>
            </div>
            <div className="grid gap-4">
              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  className="flex w-full gap-3"
                  title="Google"
                  onClick={(event) => {
                    event.preventDefault();
                    onSocialLogin("google");
                  }}
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full gap-3"
                  title="Yandex"
                  onClick={(event) => {
                    event.preventDefault();
                    onSocialLogin("yandex");
                  }}
                >
                  <YandexIcon />
                  Yandex
                </Button>
                <Button
                  variant="outline"
                  className="flex w-full gap-3"
                  title="VK"
                  onClick={(event) => {
                    event.preventDefault();
                    onSocialLogin("vkontakte");
                  }}
                >
                  <VKIcon />
                  VK
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <img
            src={backgroundImage}
            alt="Image"
            width="1920"
            height="1080"
            className="size-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
