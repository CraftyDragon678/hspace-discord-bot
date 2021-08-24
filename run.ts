import dotenv from 'dotenv';
import { stripIndent } from 'common-tags';
import {
  Client,
  DMChannel,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User,
} from 'discord.js';

dotenv.config();

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES' /* 'GUILD_MEMBERS' */],
});

const ZWSP = '\u200B';

const registerEmbed = new MessageEmbed({
  title: 'HSpace 신규 가입 안내',
  description: stripIndent`
    0. 회원가입
      0.0. hspace.io 회원가입 신청
      0.1. 소속은 학교, 직장, BoB, 소마, 케쉴주, 해킹 팀 등. 현 소속이 없을 경우 학생으로 기재
           소속 그룹은 동아리, 트랙, 포지션, 학과(전공) 등
      0.2. 승인을 위해 회원가입 시 안내해 준 사람이 오픈 채팅방에 회원가입 사실을 알릴 것
      0.3. 회원가입 승인 완료 후 로그인하여 오픈 채팅방 링크와 비밀번호 확인 후 접속
  `.replace(/^ */gm, (substring) =>
    ''.padStart(substring.length * 4, `${ZWSP} `),
  ),
});

const discordEmbed = new MessageEmbed({
  title: 'HSpace 디스코드 사용 안내',
  description: stripIndent`
    0. 공지사항 필독

    1. 자기소개 글 작성
      1.0. 양식: 소속이나 소속 그룹 | 이름 | 닉네임(있을 시) | 가입 목적 | 관심사
    
    2. 홍보
      2.0. 세미나를 포함해 모든 홍보는 관리자('hellsonic' 또는 'dakuo')의 승인 후 게시
  `.replace(/^ */gm, (substring) =>
    ''.padStart(substring.length * 4, `${ZWSP} `),
  ),
});

const spaceEmbed = new MessageEmbed({
  title: 'HSpace 공간 사용 안내',
  description: stripIndent`
    0. 사용 목적:
      0.0. 보안이나 개발 관련 스터디
      0.1. 보안이나 개발 관련 프로젝트 수행 또는 회의
        0.1.0. 단, BoB에서 수행하는 프로젝트 제외
      0.2. 보안이나 개발 관련 강의 또는 세미나
      0.3. 보안이나 개발 관련 대회 또는 해커톤 참가
      0.4. 보안이나 개발 관련 친목 모임
          0.4.0. 단, 참가조건에 제한을 두지 않아야 함

    1. Host:
      1.0. 절차
        1.0.0. hspace.io에서 공간 예약 신청
        1.0.1. 반드시 승인 허가 후 공간 사용
        1.0.2. 시간 연장 시, 새로운 예약 신청으로 연장
        1.0.3. 사용 완료 후, 사진 전송(현재는 'dakuo'에게 전송)
        1.0.4. 사용 완료 후, 뒷정리(전등/에어컨/창문) 체크
      1.1. 주의
        1.1.0. 세미나 개최 시 'open' 세미나로 개최
        1.1.1. 온라인 세미나 개최 시 Google meet 개설 후 링크를 'dakuo'에게 전송
        1.1.2. 변동 사항(시간/인원) 발생 시 오픈 채팅방에 알림

    2. Guest:
      2.0. 절차
        2.0.0. (필수) 온·오프라인 상관없이 hspace.io에서 참여할 행사에 입장 신청
        2.0.1. 온라인 행사의 경우 시작 10분 전부터 본인의 입장 신청 내역에서 접속 링크 확인 가능
      2.1. 주의
        2.1.0. 입장 신청 없이 출입 불가
        2.1.1. 입장 신청 후 불참 시 오픈 채팅방에 알림

    3. 주의 사항:
      3.0. 쓰레기
        3.0.0. 재활용·일반 쓰레기는 분리수거(캔/플라스틱/종이/일반) 할 것
        3.0.1. 음식물은 비치된 음식물 전용 쓰레기봉투에 담아서 분리수거하는 곳 앞에 둘 것
        3.0.2. 치킨, 피자 박스 같은 부피가 큰 것은 분리수거하는 곳 앞에 잘 쌓아둘 것

    4. 건의 사항:
      4.0. 오픈 채팅방에 자유롭게 신청 및 얘기
        4.0.0. 원하는 다과
        4.0.1. 스터디에 필요한 장비
        4.0.2. 행사 건의(대회, 특강 등)
        4.0.3. 기타 아이디어
  `.replace(/^ */gm, (substring) =>
    ''.padStart(substring.length * 4, `${ZWSP} `),
  ),
});

const actionRow = (disabled = false) =>
  new MessageActionRow({
    components: [
      new MessageButton({
        style: 'PRIMARY',
        customId: 'register',
        label: '신규 가입 안내',
        disabled,
      }),
      new MessageButton({
        style: 'PRIMARY',
        customId: 'discord',
        label: '디스코드 사용 안내',
        disabled,
      }),
      new MessageButton({
        style: 'PRIMARY',
        customId: 'space',
        label: '공간 사용 안내',
        disabled,
      }),
      new MessageButton({
        style: 'LINK',
        label: '기타 문의 사항',
        url: 'https://fb.com/hellsonic',
      }),
    ],
  });

const getEmbedByCustomId = (customId: string) => {
  if (customId === 'register') return registerEmbed;
  if (customId === 'discord') return discordEmbed;
  if (customId === 'space') return spaceEmbed;
  return undefined;
};

const interactionRule = async (
  author: User,
  sentMessage: Message,
): Promise<void> => {
  const interaction = await sentMessage
    .awaitMessageComponent({
      filter: (interaction) => {
        const condition = interaction.user.id === author.id;
        if (!condition) {
          interaction.reply({
            content: '!rule을 직접 입력해서 확인해보세요',
            ephemeral: true,
          });
        }
        return condition;
      },
      time: 60e3,
    })
    .catch(() => null);
  if (interaction === null) return;
  const embed = getEmbedByCustomId(interaction.customId);
  if (!embed) return;
  interaction.update({
    embeds: [embed],
    components: sentMessage.components,
  });
  return interactionRule(author, sentMessage);
};

const handleRule = async (message: Message | DMChannel) => {
  const sentMessage = await (message instanceof Message
    ? message.reply
    : message.send
  ).bind(message)({
    embeds: [
      new MessageEmbed({
        color: 0xff0000,
        title: 'HSpace 사용 안내',
        fields: [
          {
            name: '코로나 관련',
            value:
              '스페이스 실내에서도 마스크 꼭 착용, 입장 시 배치된 손소독제 사용 부탁드립니다,! 코로나 방역수칙을 꼭 준수해주시기 바라며 코로나 상황에서도 어렵게 운영되고 있으니, 공간을 서로 조심하며 지켜주었으면 좋겠습니다.',
          },
        ],
      }),
    ],
    components: [actionRow()],
  });
  await interactionRule(
    message instanceof Message ? message.author : message.recipient,
    sentMessage,
  );
  await sentMessage.edit({
    embeds: sentMessage.embeds,
    components: [actionRow(true)],
  });
};

client.on('messageCreate', async (message) => {
  if (message.content === '!rule') return handleRule(message);
});

client.on('ready', () => console.log(`${client.user?.username} is ready!`));

client.on('guildMemberAdd', async (member) => {
  handleRule(await member.createDM());
});

client.login(process.env.TOKEN!!);
